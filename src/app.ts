import express from 'express';
import cors from 'cors';
import { config } from './config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// Debug at app startup
console.log("📱 App starting...");
console.log("CORS Origin:", config.CORS_ORIGIN);

// Create Express app
const app: express.Application = express();

// CORS configuration
const corsOptions = {
  origin: config.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
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
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end(); // No content
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    console.log("🔍 Testing database connection...");
    console.log("📊 MongoDB connection state:", mongoose.connection.readyState);
    
    // Test basic database operations
    if (!mongoose.connection.db) {
      throw new Error("Database not connected");
    }
    
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
// app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log("❌ 404 - Route not found:", req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message: config.NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(config.NODE_ENV === 'development' && { stack: error.stack })
  });
});

console.log("✅ App setup complete");
export default app;
