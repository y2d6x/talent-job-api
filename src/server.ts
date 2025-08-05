import app from './app';
import { config } from './config';
import { connectDB } from './config/mongodb';

const PORT = config.PORT || 5000;

// Debug at startup
console.log("🚀 Server starting...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Vercel:", process.env.VERCEL ? "YES" : "NO");

// Start server function
const startServer = async () => {
  try {
    console.log("🔧 Starting server function...");
    
    // Connect to MongoDB
    await connectDB();
    console.log('Database connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  console.log("🔄 Starting server for local development...");
  startServer();
} else {
  console.log("🌐 Vercel environment detected, skipping server start");
}

// Export for Vercel
console.log("📦 Exporting app for Vercel...");
export default app;

