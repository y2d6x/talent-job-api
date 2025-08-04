import express from 'express';
import cors from 'cors';
import { config } from './config';
import cookieParser from 'cookie-parser';

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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Jobs API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Import routes
import authRoutes from './routes/auth';

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message: config.NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(config.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;
