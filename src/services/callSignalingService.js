/**
 * CRM nErgy — Real-Time Call Signaling Service
 * 
 * Manages WebRTC call signaling via Socket.IO and cross-platform relay with SWMTP Central Hub.
 * Strict Isolation: Internal staff audio/video calls ONLY. Customer role strictly rejected.
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');

class CallSignalingService {
  constructor() {
    this.io = null;
    // staffId -> Set of socket IDs
    this.activeStaffSockets = new Map();
    // callId -> NodeJS.Timeout
    this.ringingTimeouts = new Map();
    this.RING_TIMEOUT_MS = 35000;
  }

  getSwmtpBaseUrl() {
    return process.env.SWMTP_BASE_URL || 'http://127.0.0.1:5000/api/v1';
  }

  getConnectorKey() {
    return process.env.SWMTP_CONNECTOR_KEY || process.env.CRM_NERGY_CONNECTOR_KEY || 'crm_nergy_live_secret_key_v2_2026';
  }

  /**
   * Initializes Socket.IO on CRM nErgy HTTP server
   */
  init(httpServer) {
    if (this.io) return this.io;

    this.io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => callback(null, true),
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 20000,
      pingInterval: 10000
    });

    // JWT Authentication & Staff Role Authorization Middleware
    this.io.use(async (socket, next) => {
      try {
        const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
        if (!rawToken) {
          return next(new Error('AUTHENTICATION_REQUIRED: Missing auth token for call signaling.'));
        }

        const token = rawToken.replace(/^Bearer\s+/i, '').trim();
        const jwtSecret = process.env.JWT_SECRET || 'crm_energy_jwt_secret_key_secure_2026';
        const decoded = jwt.verify(token, jwtSecret);
        const resolvedUserId = decoded?.userId || decoded?.id;

        if (!decoded || !resolvedUserId) {
          return next(new Error('INVALID_TOKEN: Token payload is malformed.'));
        }

        const user = await prisma.user.findUnique({
          where: { id: resolvedUserId },
          select: { id: true, name: true, email: true, role: true, tenantId: true }
        });

        if (!user) {
          return next(new Error('USER_NOT_FOUND: User does not exist in CRM nErgy directory.'));
        }

        // 🛑 STRICT CUSTOMER ISOLATION: Reject Customer Accounts
        if (user.role === 'CUSTOMER') {
          return next(new Error('CUSTOMER_FORBIDDEN: Customer accounts cannot participate in internal calling.'));
        }

        socket.user = user;
        socket.staffId = user.id;
        socket.tenantId = user.tenantId;
        socket.displayName = user.name;

        next();
      } catch (err) {
        return next(new Error(`AUTHENTICATION_FAILED: ${err.message}`));
      }
    });

    // Connection Handler
    this.io.on('connection', (socket) => {
      const staffId = socket.staffId;
      const staffAliases = [socket.staffId, socket.user?.id, socket.user?.email].filter(Boolean);
      if (socket.user?.email === 'vikram.m@crmnergy.io' || socket.user?.name === 'Vikram Mehta' || staffId === 'crm-staff-001') {
        staffAliases.push('crm-staff-001');
      }

      staffAliases.forEach((alias) => {
        if (!this.activeStaffSockets.has(alias)) {
          this.activeStaffSockets.set(alias, new Set());
        }
        this.activeStaffSockets.get(alias).add(socket.id);
        socket.join(`staff:${alias}`);
      });

      socket.join(`tenant:${socket.tenantId}`);

      console.log(`[CRM CallSignaling] Staff connected: ${socket.displayName} (${staffId}) [Socket ${socket.id}]`);

      // 1. Initiate Outbound Call (CRM nErgy Staff -> SWMTP Master Admin)
      socket.on('call:initiate', async (data, callback) => {
        try {
          const result = await this.handleInitiateCall(socket, data);
          if (typeof callback === 'function') callback({ success: true, ...result });
        } catch (err) {
          console.error('[CRM CallSignaling initiate error]:', err.message);
          if (typeof callback === 'function') callback({ success: false, error: err.message });
          socket.emit('call:error', { message: err.message });
        }
      });

      // 2. Accept Incoming Call
      socket.on('call:accept', async (data, callback) => {
        try {
          await this.handleAcceptCall(socket, data);
          if (typeof callback === 'function') callback({ success: true });
        } catch (err) {
          console.error('[CRM CallSignaling accept error]:', err.message);
          if (typeof callback === 'function') callback({ success: false, error: err.message });
        }
      });

      // 3. Decline Incoming Call
      socket.on('call:decline', async (data, callback) => {
        try {
          await this.handleDeclineCall(socket, data);
          if (typeof callback === 'function') callback({ success: true });
        } catch (err) {
          console.error('[CRM CallSignaling decline error]:', err.message);
          if (typeof callback === 'function') callback({ success: false, error: err.message });
        }
      });

      // 4. Cancel Outbound Call
      socket.on('call:cancel', async (data, callback) => {
        try {
          await this.handleCancelCall(socket, data);
          if (typeof callback === 'function') callback({ success: true });
        } catch (err) {
          console.error('[CRM CallSignaling cancel error]:', err.message);
          if (typeof callback === 'function') callback({ success: false, error: err.message });
        }
      });

      // 5. Exchange WebRTC Signaling (SDP Offer, Answer, ICE Candidates)
      socket.on('call:signal', async (data) => {
        try {
          await this.handleWebRtcSignal(socket, data);
        } catch (err) {
          console.error('[CRM CallSignaling signal error]:', err.message);
        }
      });

      // 6. End Active Call
      socket.on('call:end', async (data, callback) => {
        try {
          await this.handleEndCall(socket, data);
          if (typeof callback === 'function') callback({ success: true });
        } catch (err) {
          console.error('[CRM CallSignaling end error]:', err.message);
          if (typeof callback === 'function') callback({ success: false, error: err.message });
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        staffAliases.forEach((alias) => {
          const set = this.activeStaffSockets.get(alias);
          if (set) {
            set.delete(socket.id);
            if (set.size === 0) {
              this.activeStaffSockets.delete(alias);
            }
          }
        });
        console.log(`[CRM CallSignaling] Staff disconnected: ${socket.displayName} (${staffId})`);
      });
    });

    return this.io;
  }

  isStaffOnline(staffId) {
    if (!staffId) return false;
    const direct = this.activeStaffSockets.get(staffId);
    if (direct && direct.size > 0) return true;
    if (staffId === 'crm-staff-001') {
      const alias = this.activeStaffSockets.get('vikram.m@crmnergy.io');
      if (alias && alias.size > 0) return true;
    }
    return false;
  }

  /**
   * 1. Staff initiates outbound call to SWMTP Master Admin
   */
  async handleInitiateCall(socket, { targetStaffId = 'staff-admin-01', targetDisplayName = 'Master Administrator', callType = 'audio', conversationId = 'conv-swmtp-main' }) {
    const callerStaffId = socket.staffId;
    const callerName = socket.displayName;
    const tenantId = socket.tenantId;

    // Check if staff already has an active call
    const active = await prisma.staffCallSession.findFirst({
      where: {
        tenantId,
        OR: [
          { callerStaffId },
          { recipientStaffId: callerStaffId }
        ],
        status: { in: ['initiated', 'ringing', 'accepted', 'connecting', 'connected'] }
      }
    });

    if (active) {
      throw new Error('ALREADY_IN_CALL: You already have an active call session.');
    }

    const callId = `call_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Persist call session in MySQL
    await prisma.staffCallSession.create({
      data: {
        id: callId,
        tenantId,
        conversationId,
        callType,
        callerPlatformId: 'cp-crm-nergy',
        callerStaffId,
        callerName,
        recipientPlatformId: 'cp-swmtp-core',
        recipientStaffId: targetStaffId,
        recipientName: targetDisplayName,
        status: 'ringing'
      }
    });

    // Start 35s unanswered timeout timer
    this.startRingingTimeout(callId, callerStaffId, targetStaffId);

    // Dispatch invitation to SWMTP Central Hub
    const dispatchResult = await this.dispatchCallSignalToSwmtp({
      signalType: 'CALL_INVITATION',
      callId,
      callType,
      conversationId,
      caller: {
        platformId: 'cp-crm-nergy',
        platformKey: 'crm-nergy',
        staffId: callerStaffId,
        displayName: callerName
      },
      recipient: {
        platformId: 'cp-swmtp-core',
        platformKey: 'swmtp',
        staffId: targetStaffId,
        displayName: targetDisplayName
      },
      timestamp: new Date().toISOString()
    });

    if (!dispatchResult.success) {
      this.clearRingingTimeout(callId);
      const reason = dispatchResult.reason || 'offline';

      await prisma.staffCallSession.update({
        where: { id: callId },
        data: {
          status: reason === 'busy' ? 'busy' : 'failed',
          terminationReason: reason === 'busy' ? 'busy_user' : 'recipient_offline',
          endedAt: new Date()
        }
      });

      socket.emit('call:unavailable', {
        callId,
        reason,
        message: reason === 'busy' ? 'SWMTP Master Administrator is currently on another call.' : 'SWMTP Master Administrator is currently offline or unreachable.'
      });

      return { callId, status: reason === 'busy' ? 'busy' : 'offline', delivered: false };
    }

    socket.emit('call:ringing', {
      callId,
      callType,
      recipient: {
        staffId: targetStaffId,
        displayName: targetDisplayName,
        platformKey: 'swmtp'
      }
    });

    return { callId, status: 'ringing', delivered: true };
  }

  /**
   * 2. Staff accepts call
   */
  async handleAcceptCall(socket, { callId }) {
    this.clearRingingTimeout(callId);
    const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
    if (!session) throw new Error('Call session not found.');

    await prisma.staffCallSession.update({
      where: { id: callId },
      data: { status: 'accepted' }
    });

    await this.dispatchCallSignalToSwmtp({
      signalType: 'CALL_ACCEPTED',
      callId,
      acceptedBy: socket.staffId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 3. Staff declines call
   */
  async handleDeclineCall(socket, { callId }) {
    this.clearRingingTimeout(callId);
    const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
    if (!session) return;

    await prisma.staffCallSession.update({
      where: { id: callId },
      data: {
        status: 'declined',
        terminationReason: 'declined_by_recipient',
        endedAt: new Date()
      }
    });

    await this.dispatchCallSignalToSwmtp({
      signalType: 'CALL_DECLINED',
      callId,
      declinedBy: socket.staffId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 4. Staff cancels outgoing call
   */
  async handleCancelCall(socket, { callId }) {
    this.clearRingingTimeout(callId);
    const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
    if (!session) return;

    await prisma.staffCallSession.update({
      where: { id: callId },
      data: {
        status: 'missed',
        terminationReason: 'caller_cancelled',
        endedAt: new Date()
      }
    });

    await this.dispatchCallSignalToSwmtp({
      signalType: 'CALL_CANCELLED',
      callId,
      cancelledBy: socket.staffId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 5. WebRTC signal routing (Offer, Answer, ICE Candidates)
   */
  async handleWebRtcSignal(socket, { callId, signal }) {
    const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
    if (!session) return;

    if (signal && signal.type === 'answer') {
      await prisma.staffCallSession.update({
        where: { id: callId },
        data: {
          status: 'connected',
          connectedAt: new Date()
        }
      });
    }

    await this.dispatchCallSignalToSwmtp({
      signalType: 'CALL_SIGNAL',
      callId,
      senderStaffId: socket.staffId,
      signal,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 6. End active call
   */
  async handleEndCall(socket, { callId, reason = 'normal_hangup' }) {
    this.clearRingingTimeout(callId);
    const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
    if (!session) return;

    let duration = 0;
    if (session.connectedAt) {
      duration = Math.max(0, Math.floor((new Date() - new Date(session.connectedAt)) / 1000));
    }

    await prisma.staffCallSession.update({
      where: { id: callId },
      data: {
        status: 'completed',
        terminationReason: reason,
        endedAt: new Date(),
        durationSeconds: duration
      }
    });

    await this.dispatchCallSignalToSwmtp({
      signalType: 'CALL_ENDED',
      callId,
      endedBy: socket.staffId,
      reason,
      durationSeconds: duration,
      timestamp: new Date().toISOString()
    });

    socket.emit('call:ended', {
      callId,
      endedBy: socket.staffId,
      reason,
      durationSeconds: duration
    });
  }

  startRingingTimeout(callId, callerStaffId, recipientStaffId) {
    this.clearRingingTimeout(callId);

    const timeout = setTimeout(async () => {
      try {
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session && session.status === 'ringing') {
          await prisma.staffCallSession.update({
            where: { id: callId },
            data: {
              status: 'missed',
              terminationReason: 'no_answer_timeout',
              endedAt: new Date()
            }
          });

          this.io.to(`staff:${callerStaffId}`).emit('call:timeout', {
            callId,
            message: 'No answer. Call timed out.'
          });

          this.dispatchCallSignalToSwmtp({
            signalType: 'CALL_TIMEOUT',
            callId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('[CRM CallSignaling timeout error]:', err.message);
      } finally {
        this.ringingTimeouts.delete(callId);
      }
    }, this.RING_TIMEOUT_MS);

    this.ringingTimeouts.set(callId, timeout);
  }

  clearRingingTimeout(callId) {
    if (this.ringingTimeouts.has(callId)) {
      clearTimeout(this.ringingTimeouts.get(callId));
      this.ringingTimeouts.delete(callId);
    }
  }

  /**
   * Outbound dispatcher to SWMTP Hub call-signals receiver
   */
  async dispatchCallSignalToSwmtp(payload) {
    const baseUrl = this.getSwmtpBaseUrl();
    const key = this.getConnectorKey();
    const targetUrl = `${baseUrl.replace(/\/+$/, '')}/internal-chat/integrations/crm-nergy/call-signals`;

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Api-Key': key
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, ...data };
      } else {
        return { success: false, reason: data.reason || 'offline', error: data.error };
      }
    } catch (err) {
      console.warn(`[CRM CallSignaling] SWMTP Hub unreachable (${err.message}).`);
      return { success: false, reason: 'offline', error: err.message };
    }
  }

  /**
   * Inbound processor: Handles call signals from SWMTP Central Hub
   */
  async handleInboundSwmtpCallSignal(payload) {
    const { signalType, callId, callType = 'audio', caller, recipient, signal, reason } = payload;

    switch (signalType) {
      case 'CALL_INVITATION': {
        const targetStaffId = recipient?.staffId;
        if (!targetStaffId) {
          return { success: false, reason: 'invalid_recipient', message: 'recipient.staffId is required.' };
        }

        // Verify recipient in CRM nErgy DB
        const staff = await prisma.user.findFirst({
          where: {
            OR: [
              { id: targetStaffId },
              { email: targetStaffId }
            ]
          }
        });

        if (!staff) {
          return { success: false, reason: 'not_found', message: `Staff member '${targetStaffId}' not found.` };
        }

        if (staff.role === 'CUSTOMER') {
          return { success: false, reason: 'customer_forbidden', message: 'Customer accounts cannot receive internal staff calls.' };
        }

        // Check if recipient is connected
        if (!this.isStaffOnline(staff.id)) {
          return { success: false, reason: 'offline', message: `Staff member '${staff.name}' is currently offline.` };
        }

        // Check if recipient is already in another call
        const active = await prisma.staffCallSession.findFirst({
          where: {
            tenantId: staff.tenantId,
            OR: [
              { callerStaffId: staff.id },
              { recipientStaffId: staff.id }
            ],
            status: { in: ['initiated', 'ringing', 'accepted', 'connecting', 'connected'] }
          }
        });

        if (active) {
          return { success: false, reason: 'busy', message: `Staff member '${staff.name}' is currently on another call.` };
        }

        // Persist in DB
        await prisma.staffCallSession.create({
          data: {
            id: callId,
            tenantId: staff.tenantId,
            conversationId: payload.conversationId || 'conv-swmtp-main',
            callType,
            callerPlatformId: 'cp-swmtp-core',
            callerStaffId: caller?.staffId || 'staff-admin-01',
            callerName: caller?.displayName || 'Master Administrator',
            recipientPlatformId: 'cp-crm-nergy',
            recipientStaffId: staff.id,
            recipientName: staff.name,
            status: 'ringing'
          }
        });

        this.startRingingTimeout(callId, caller?.staffId, staff.id);

        // Emit incoming call modal event to recipient staff socket!
        this.io.to(`staff:${staff.id}`).emit('call:incoming', {
          callId,
          callType,
          conversationId: payload.conversationId || 'conv-swmtp-main',
          caller: {
            platformKey: 'swmtp',
            platformName: 'SWMTP Central Hub',
            staffId: caller?.staffId || 'staff-admin-01',
            displayName: caller?.displayName || 'Master Administrator'
          },
          recipient: {
            platformKey: 'crm-nergy',
            staffId: staff.id,
            displayName: staff.name
          },
          timestamp: payload.timestamp || new Date().toISOString()
        });

        return { success: true, delivered: true, callId };
      }

      case 'CALL_ACCEPTED': {
        this.clearRingingTimeout(callId);
        await prisma.staffCallSession.updateMany({
          where: { id: callId },
          data: { status: 'accepted' }
        });
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session) {
          this.io.to(`staff:${session.callerStaffId}`).emit('call:accepted', { callId });
        }
        return { success: true };
      }

      case 'CALL_DECLINED': {
        this.clearRingingTimeout(callId);
        await prisma.staffCallSession.updateMany({
          where: { id: callId },
          data: {
            status: 'declined',
            terminationReason: 'declined_by_recipient',
            endedAt: new Date()
          }
        });
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session) {
          this.io.to(`staff:${session.callerStaffId}`).emit('call:declined', {
            callId,
            message: 'Call was declined by recipient.'
          });
        }
        return { success: true };
      }

      case 'CALL_CANCELLED': {
        this.clearRingingTimeout(callId);
        await prisma.staffCallSession.updateMany({
          where: { id: callId },
          data: {
            status: 'missed',
            terminationReason: 'caller_cancelled',
            endedAt: new Date()
          }
        });
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session) {
          this.io.to(`staff:${session.recipientStaffId}`).emit('call:cancelled', { callId });
        }
        return { success: true };
      }

      case 'CALL_TIMEOUT': {
        this.clearRingingTimeout(callId);
        await prisma.staffCallSession.updateMany({
          where: { id: callId },
          data: {
            status: 'missed',
            terminationReason: 'no_answer_timeout',
            endedAt: new Date()
          }
        });
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session) {
          this.io.to(`staff:${session.recipientStaffId}`).emit('call:timeout', { callId });
          this.io.to(`staff:${session.callerStaffId}`).emit('call:timeout', { callId });
        }
        return { success: true };
      }

      case 'CALL_SIGNAL': {
        if (signal && signal.type === 'answer') {
          await prisma.staffCallSession.updateMany({
            where: { id: callId },
            data: {
              status: 'connected',
              connectedAt: new Date()
            }
          });
        }
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session) {
          const isCaller = (session.callerPlatformId === 'cp-swmtp-core');
          const targetStaffId = isCaller ? session.recipientStaffId : session.callerStaffId;
          this.io.to(`staff:${targetStaffId}`).emit('call:signal', {
            callId,
            signal,
            senderStaffId: payload.senderStaffId
          });
        }
        return { success: true };
      }

      case 'CALL_ENDED': {
        this.clearRingingTimeout(callId);
        await prisma.staffCallSession.updateMany({
          where: { id: callId },
          data: {
            status: 'completed',
            terminationReason: reason || 'normal_hangup',
            endedAt: new Date(),
            durationSeconds: payload.durationSeconds || 0
          }
        });
        const session = await prisma.staffCallSession.findUnique({ where: { id: callId } });
        if (session) {
          const isCaller = (session.callerPlatformId === 'cp-swmtp-core');
          const targetStaffId = isCaller ? session.recipientStaffId : session.callerStaffId;
          this.io.to(`staff:${targetStaffId}`).emit('call:ended', {
            callId,
            endedBy: payload.endedBy,
            reason: reason || 'normal_hangup',
            durationSeconds: payload.durationSeconds || 0
          });
        }
        return { success: true };
      }

      default:
        return { success: false, error: `Unsupported signalType: ${signalType}` };
    }
  }

  getIceServers() {
    const iceServers = [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
    ];

    if (process.env.TURN_SERVER_URL) {
      iceServers.push({
        urls: [process.env.TURN_SERVER_URL],
        username: process.env.TURN_SERVER_USERNAME || '',
        credential: process.env.TURN_SERVER_CREDENTIAL || ''
      });
    }

    return iceServers;
  }
}

const callSignalingService = new CallSignalingService();

module.exports = {
  callSignalingService,
  initCallSignaling: (server) => callSignalingService.init(server)
};
