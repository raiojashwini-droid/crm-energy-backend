const dotenv = require('dotenv');

// Load environment variables before starting server
dotenv.config();

const app = require('./app');
const { initCallSignaling } = require('./services/callSignalingService');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] CRM nErgy API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  
  // Initialize Socket.IO Call Signaling Service
  initCallSignaling(server);
  console.log(`[Call Signaling] CRM nErgy Socket.IO call signaling initialized on port ${PORT}`);
});

// Handle server startup & runtime errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      console.error('Server error:', error);
      process.exit(1);
  }
});

// Process-level unhandled exception/rejection safety handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
