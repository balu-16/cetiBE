import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route modules
import authRoutes from './routes/auth.js';
import certificatesRoutes from './routes/certificates.js';
import emailRoutes from './routes/email.js';
import testRoutes from './routes/test.js';
import studentsRoutes from './routes/students.js';
import smsRoutes from './routes/sms.js';

// Load environment variables first
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Certificate Hub Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/v1/auth',
      certificates: '/v1/certificates',
      email: '/v1/email',
      students: '/v1/students',
      sms: '/v1/sms/send'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Create async middleware wrapper
function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Mount route modules
app.use('/v1/auth', authRoutes);
app.use('/v1/certificates', certificatesRoutes);
app.use('/v1/email', emailRoutes);
app.use('/v1/test', testRoutes);
app.use('/v1/students', studentsRoutes);
app.use('/v1/sms', smsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      auth: '/v1/auth',
      certificates: '/v1/certificates',
      email: '/v1/email',
      students: '/v1/students',
      sms: '/v1/sms/send'
    }
  });
});

// Conditional server start for local development
// Check if this file is being run directly (not imported)
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Ready to accept requests!`);
  });
}

// Export the app for serverless deployment
export default app;