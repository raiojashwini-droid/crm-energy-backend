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

// CORS configuration - supports Netlify, Railway, localhost, and env-configured origins
const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://crm-energy.netlify.app',
  'https://crm-energy-backend-production.up.railway.app',
  ...parseOrigins(process.env.CORS_ORIGIN),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    const isExplicitlyAllowed = defaultAllowedOrigins.includes(normalizedOrigin);
    const isLocalhost =
      normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.startsWith('http://127.0.0.1:');
    const isNetlify =
      normalizedOrigin.endsWith('.netlify.app') ||
      normalizedOrigin === 'https://crm-energy.netlify.app';
    const isRailway = normalizedOrigin.endsWith('.railway.app');

    if (isExplicitlyAllowed || isLocalhost || isNetlify || isRailway) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsing middleware with safety limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
