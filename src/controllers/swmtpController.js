const swmtpService = require('../services/swmtpService');

class SwmtpController {
  async getHealth(req, res) {
    return res.status(200).json({
      platform: 'crm-nergy',
      name: 'CRM nErgy Staff Messaging Service',
      status: 'online',
      timestamp: new Date().toISOString()
    });
  }

  async receiveMessage(req, res) {
    try {
      const result = await swmtpService.handleInboundMessage({
        body: req.body,
        rawBody: req.rawBody,
        headers: req.headers
      });

      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getStaffInbox(req, res) {
    try {
      const staffId = req.params.staffId;
      const messages = await swmtpService.getStaffInbox(staffId);
      return res.status(200).json({
        success: true,
        staffId,
        count: messages.length,
        messages
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async sendStaffReply(req, res) {
    try {
      const { conversationId, senderStaffId, textContent, idempotencyKey } = req.body;
      const result = await swmtpService.sendStaffReply({
        tenantId: req.user?.tenantId || 'TENANT-08492',
        userId: req.user?.id || senderStaffId || 'crm-staff-001',
        conversationId,
        textContent,
        idempotencyKey
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async handleCallSignal(req, res) {
    try {
      const apiKey = req.headers['x-platform-api-key'] || req.headers['x-api-key'];
      const validKey = process.env.SWMTP_CONNECTOR_KEY || process.env.CRM_NERGY_CONNECTOR_KEY || 'crm_nergy_live_secret_key_v2_2026';

      if (apiKey !== validKey) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED: Invalid connector API key.'
        });
      }

      const { callSignalingService } = require('../services/callSignalingService');
      const result = await callSignalingService.handleInboundSwmtpCallSignal(req.body);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(result.reason === 'offline' ? 404 : 400).json(result);
      }
    } catch (error) {
      console.error('[CRM CallSignal Controller Error]:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getIceServers(req, res) {
    try {
      const { callSignalingService } = require('../services/callSignalingService');
      const iceServers = callSignalingService.getIceServers();
      return res.status(200).json({ success: true, iceServers });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCallHistory(req, res) {
    try {
      const prisma = require('../config/prisma');
      const staffId = req.params.staffId;
      const history = await prisma.staffCallSession.findMany({
        where: {
          OR: [
            { callerStaffId: staffId },
            { recipientStaffId: staffId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      return res.status(200).json({ success: true, history, count: history.length });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SwmtpController();
