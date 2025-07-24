import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Simple route handlers without lazy loading to avoid import issues
app.use('/v1/auth', asyncMiddleware(async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Auth service temporarily unavailable',
    message: 'Please try again later'
  });
}));

app.use('/v1/certificates', asyncMiddleware(async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Certificate service temporarily unavailable',
    message: 'Please try again later'
  });
}));

app.use('/v1/email', asyncMiddleware(async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Email service temporarily unavailable',
    message: 'Please try again later'
  });
}));

app.use('/v1/test', asyncMiddleware(async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Test service temporarily unavailable',
    message: 'Please try again later'
  });
}));

// SMS endpoint
app.post('/v1/sms/send', asyncMiddleware(async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }
    
    res.status(503).json({
      success: false,
      error: 'SMS service temporarily unavailable',
      message: 'Please try again later'
    });
    
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: error.message
    });
  }
}));

// Students endpoints
app.get('/v1/students', asyncMiddleware(async (req, res) => {
  try {
    res.status(503).json({
      success: false,
      error: 'Database service temporarily unavailable',
      message: 'Please try again later'
    });
    
  } catch (error) {
    console.error('❌ Students fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      details: error.message
    });
  }
}));

// Certificate generation endpoint
app.post('/v1/certificates/generate/:studentId', asyncMiddleware(async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`🎓 Certificate generation request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    res.status(503).json({
      success: false,
      error: 'Certificate generation service temporarily unavailable',
      message: 'Please try again later'
    });
    
  } catch (error) {
    console.error('❌ Certificate generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate',
      details: error.message
    });
  }
}));

// Certificate download endpoint
app.get('/v1/certificates/download/:studentId', asyncMiddleware(async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📥 Certificate download request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    res.status(503).json({
      success: false,
      error: 'Certificate download service temporarily unavailable',
      message: 'Please try again later'
    });
    
  } catch (error) {
    console.error('❌ Certificate download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download certificate',
      details: error.message
    });
  }
}));

// Certificate status endpoint
app.get('/v1/certificates/status/:studentId', asyncMiddleware(async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📋 Certificate status request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    res.status(503).json({
      success: false,
      error: 'Certificate status service temporarily unavailable',
      message: 'Please try again later'
    });
    
  } catch (error) {
    console.error('❌ Certificate status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate status',
      details: error.message
    });
  }
}));

// Update student eligibility status
app.put('/v1/students/:studentId/eligibility', asyncMiddleware(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { eligible } = req.body;
    
    console.log(`🎯 Eligibility update request for student ID: ${studentId}, eligible: ${eligible}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    if (typeof eligible !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Eligible status must be a boolean value'
      });
    }
    
    res.status(503).json({
      success: false,
      error: 'Student eligibility service temporarily unavailable',
      message: 'Please try again later'
    });
    
  } catch (error) {
    console.error('❌ Eligibility update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student eligibility',
      details: error.message
    });
  }
}));

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

// Export the app for serverless deployment
export default app;