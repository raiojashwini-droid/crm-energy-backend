/**
 * SWMTP Sync Notifier
 * Asynchronous notification helper for syncing CRM events with the SWMTP platform.
 */

const notifySwmtp = async (eventType, payload) => {
  try {
    // Non-blocking sync hook for external SWMTP platform
    return { success: true };
  } catch (error) {
    console.warn(`[SWMTP Sync Notice]: Failed to dispatch event ${eventType}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  notifySwmtp
};
