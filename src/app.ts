import express from 'express';
import { config } from './config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { securityHeaders, corsOptions } from './middleware/security';
import { apiRateLimit } from './middleware/rateLimit';
import { errorHandler } from './utils/errorHandler';
import cors from 'cors';

// Debug at app startup
console.log("📱 App starting...");

// Create Express app
const app: express.Application = express();

// Security middleware
app.use(securityHeaders);

// CORS with credentials + preflight
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
app.use(apiRateLimit);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Middleware for parsing cookies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log("🏥 Health check requested");
  res.status(200).json({
    status: 'OK',
    message: 'Jobs API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log("🏠 Root endpoint requested");
  res.status(200).json({
    success: true,
    message: 'Jobs API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      auth: '/api/auth'
    }
  });
});

// Favicon endpoints
app.get('/favicon.ico', (req, res) => { res.status(204).end(); });
app.get('/favicon.png', (req, res) => { res.status(204).end(); });

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    console.log("🔍 Testing database connection...");
    console.log("📊 MongoDB connection state:", mongoose.connection.readyState);

    if (!mongoose.connection.db) throw new Error("Database not connected");

    const testResult = await mongoose.connection.db.admin().ping();
    console.log("✅ Database ping result:", testResult);

    res.status(200).json({
      success: true,
      message: 'Database connection test',
      connectionState: mongoose.connection.readyState,
      pingResult: testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ Database test error:", error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      connectionState: mongoose.connection.readyState
    });
  }
});

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/job';
import applicationRoutes from './routes/application';
import userRoutes from './routes/user';
import dashboardRoutes from './routes/dashboard';
import searchRoutes from './routes/search';
import notificationRoutes from './routes/notification';
import settingsRoutes from './routes/settings';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log("❌ 404 - Route not found:", req.originalUrl);
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

// Global error handler
app.use(errorHandler);

console.log("✅ App setup complete");
export default app;
