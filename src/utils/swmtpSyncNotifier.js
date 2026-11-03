/**
 * SWMTP Sync Notifier Utility
 * Dispatches sync telemetry and notification events to SWMTP Central Hub fail-safely.
 */
async function notifySwmtp(eventType, payload = {}) {
  try {
    const swmtpService = require('../services/swmtpService');
    if (swmtpService && typeof swmtpService.notifyEvent === 'function') {
      return await swmtpService.notifyEvent(eventType, payload);
    }
  } catch (err) {
    // Non-blocking fail-safe: log warning without interrupting transactions
    console.warn('[SWMTP Sync Notifier]:', err?.message || err);
  }
  return null;
}

module.exports = {
  notifySwmtp,
};
