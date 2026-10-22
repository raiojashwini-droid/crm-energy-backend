const express = require('express');
const router = express.Router();
const swmtpController = require('../controllers/swmtpController');

// 1. Health & Capability Check
router.get('/health', (req, res) => swmtpController.getHealth(req, res));

// 2. Inbound Webhook: Receives message from SWMTP Master Admin
router.post('/messages', (req, res) => swmtpController.receiveMessage(req, res));

// 3. Staff Inbox Query
router.get('/inbox/:staffId', (req, res) => swmtpController.getStaffInbox(req, res));

// 4. Outbound Staff Reply Trigger
router.post('/reply', (req, res) => swmtpController.sendStaffReply(req, res));


// 5. Inbound Cross-Platform Call Signals from SWMTP Hub
router.post('/call-signals', (req, res) => swmtpController.handleCallSignal(req, res));

// 6. ICE Servers Configuration for WebRTC
router.get('/calls/ice-servers', (req, res) => swmtpController.getIceServers(req, res));

// 7. Call History for Staff Member
router.get('/calls/history/:staffId', (req, res) => swmtpController.getCallHistory(req, res));

module.exports = router;
