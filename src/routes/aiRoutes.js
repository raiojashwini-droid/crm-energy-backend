const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const KIAAN_AI_BASE_URL = process.env.KIAAN_AI_URL || 'http://localhost:5000';
const CRM_CONNECTOR_KEY = process.env.CRM_NERGY_CONNECTOR_KEY || 'crm_nergy_live_secret_key_v2_2026';

/**
 * GET /api/ai/status
 * Returns health and configuration status of Kiaan AI integration.
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(`${KIAAN_AI_BASE_URL}/api/integration/crm-nergy`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      return res.status(200).json({
        available: false,
        softwareId: 'crm-nergy',
        error: `Kiaan AI returned HTTP ${resp.status}`
      });
    }

    const data = await resp.json();
    return res.status(200).json({
      available: true,
      softwareId: 'crm-nergy',
      integration: data.integration
    });
  } catch (err) {
    return res.status(200).json({
      available: false,
      softwareId: 'crm-nergy',
      error: err.message
    });
  }
});

/**
 * POST /api/ai/chat
 * Proxies chat requests to Kiaan AI software integration endpoint.
 * Injects verified tenantId, user context, and connector credentials.
 */
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, conversationId, stream = false } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ success: false, error: 'Message content is required.' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  try {
    const kiaanHeaders = {
      'Content-Type': 'application/json',
      'x-software-id': 'crm-nergy',
      'x-integration-key': CRM_CONNECTOR_KEY,
      'x-tenant-id': req.user.tenantId,
      'x-software-token': token,
      'Authorization': `Bearer ${token}`
    };

    const abortController = new AbortController();
    req.on('close', () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    });

    const kiaanResponse = await fetch(`${KIAAN_AI_BASE_URL}/api/integration/chat`, {
      method: 'POST',
      headers: kiaanHeaders,
      body: JSON.stringify({
        message,
        conversationId,
        stream: Boolean(stream)
      }),
      signal: abortController.signal
    });

    if (!kiaanResponse.ok) {
      const errText = await kiaanResponse.text();
      let parsedErr = errText;
      try {
        const j = JSON.parse(errText);
        parsedErr = j.error || j.message || errText;
      } catch {}
      return res.status(kiaanResponse.status).json({
        success: false,
        error: parsedErr
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const reader = kiaanResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } catch (streamErr) {
        if (!abortController.signal.aborted) {
          console.warn('[CRM AI Proxy] Stream interrupted:', streamErr.message);
        }
      } finally {
        res.end();
      }
    } else {
      const data = await kiaanResponse.json();
      return res.status(200).json(data);
    }
  } catch (err) {
    console.error('[CRM AI Proxy] Failed to connect to Kiaan AI:', err.message);
    return res.status(503).json({
      success: false,
      error: 'Kiaan AI Engine is currently unreachable. Please ensure the AI backend is active on port 5000.'
    });
  }
});

module.exports = router;
