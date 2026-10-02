const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dealRoutes = require('./routes/dealRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const erpRoutes = require('./routes/erpRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const territoryRoutes = require('./routes/territoryRoutes');
const hrRoutes = require('./routes/hrRoutes');
const supportRoutes = require('./routes/supportRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const eboxRoutes = require('./routes/eboxRoutes');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - supports localhost:3000, localhost:5173, and any development port
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CRM nErgy API is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/territories', territoryRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/ebox', eboxRoutes);

// 404 Handler for unknown routes
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
