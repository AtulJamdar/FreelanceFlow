const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess, sendError } = require('./utils/apiResponse');

const authRouter = require('./modules/auth/auth.routes');
const clientRouter = require('./modules/clients/client.routes');
const projectRouter = require('./modules/projects/project.routes');
const milestoneRouter = require('./modules/milestones/milestone.routes');
const invoiceRouter = require('./modules/invoices/invoice.routes');
const paymentRouter = require('./modules/payments/payment.routes');
const devRouter = require('./modules/dev/dev.routes');
const dashboardRouter = require('./modules/dashboard/dashboard.routes');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000'],
  credentials: true
}));

if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

// API Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/clients', clientRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1', milestoneRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1', paymentRouter);
app.use('/api/v1/dev', devRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// API Health Check
app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, {
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.get('/', (req, res) => {
  res.status(200).json({message:"FreelanceFlow Backend API is running."});
});

// Fallback 404 Handler for undefined routes
app.use((req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  err.code = 'NOT_FOUND';
  next(err);
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
