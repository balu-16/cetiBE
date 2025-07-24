import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import certificatesRoutes from './routes/certificates.js';
import emailRoutes from './routes/email.js';
import testRoutes from './routes/test.js';
import supabase from './supabaseClient.js';
import { WorkingOtpService } from './test-otp.js';
import CertificateGenerator from './services/certificateGenerator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
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

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/certificates', certificatesRoutes);
app.use('/v1/email', emailRoutes);
app.use('/v1/test', testRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('otp_sessions')
      .select('count')
      .limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: {
        status: error ? 'error' : 'connected',
        error: error?.message
      },
      services: {
        sms: 'available',
        otp: 'available'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// SMS API endpoint - using WorkingOtpService
app.post('/v1/sms/send', async (req, res) => {
  console.log('📱 SMS endpoint called!');
  console.log('📱 Request body:', req.body);
  console.log('📱 Request headers:', req.headers);
  
  try {
    const { phoneNumber, message } = req.body;
    
    console.log(`📱 Received SMS request for ${phoneNumber}`);
    console.log(`📱 Message: ${message}`);
    
    if (!phoneNumber) {
      console.log('❌ Missing phoneNumber');
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // Extract OTP from message if it contains one
    const otpMatch = message.match(/\b\d{6}\b/);
    if (otpMatch) {
      const otp = otpMatch[0];
      console.log(`📱 Detected OTP in message: ${otp}`);
      
      // Use WorkingOtpService to send OTP SMS
      const result = await WorkingOtpService.sendOtpSms(phoneNumber, otp);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } else {
      console.log('❌ No OTP found in message');
      res.status(400).json({
        success: false,
        error: 'Message must contain a 6-digit OTP'
      });
    }
    
  } catch (error) {
    console.error('📱 SMS Service Error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to send SMS: ${error.message}`
    });
  }
});



// Certificate management endpoints
app.get('/v1/students', async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('deleted', false);
    
    if (error) {
      return res.status(500).json({ 
        error: 'Failed to fetch students',
        details: error.message 
      });
    }
    
    res.status(200).json({
      status: 'success',
      count: students.length,
      students
    });
    
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Initialize services
const certificateGenerator = new CertificateGenerator();

// Generate certificate for a student
app.post('/v1/certificates/generate/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`🎓 Certificate generation request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    const result = await certificateGenerator.generateAndSaveCertificate(parseInt(studentId));
    
    // Certificate generated successfully - stored in database only
    
    res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Certificate generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate',
      details: error.message
    });
  }
});

// Download certificate for a student
app.get('/v1/certificates/download/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📥 Certificate download request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    const certificateData = await certificateGenerator.getCertificate(parseInt(studentId));
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificateData.studentName}_Certificate_${certificateData.certificateId}.pdf"`);
    
    // Send the certificate bytes
    res.send(Buffer.from(certificateData.certificate));
    
  } catch (error) {
    console.error('❌ Certificate download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download certificate',
      details: error.message
    });
  }
});

// Get certificate status for a student
app.get('/v1/certificates/status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    const { data: student, error } = await supabase
      .from('students')
      .select('name, certificate_id, certificate')
      .eq('student_id', parseInt(studentId))
      .single();
    
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch certificate status',
        details: error.message
      });
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    const hasCertificate = !!student.certificate;
    
    res.status(200).json({
      success: true,
      data: {
        studentName: student.name,
        certificateId: student.certificate_id,
        hasCertificate,
        generatedAt: null,
        status: hasCertificate ? 'generated' : 'not_generated'
      }
    });
    
  } catch (error) {
    console.error('❌ Certificate status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate status',
      details: error.message
    });
  }
});





// Update student eligibility status
app.put('/v1/students/:studentId/eligibility', async (req, res) => {
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
    
    // First, check if student exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('student_id, name, eligible')
      .eq('student_id', parseInt(studentId))
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching student:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Student not found',
        details: fetchError.message
      });
    }
    
    console.log(`📋 Current student data:`, existingStudent);
    
    // Try to update eligibility
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({ eligible })
      .eq('student_id', parseInt(studentId))
      .select('student_id, name, eligible')
      .single();
    
    if (updateError) {
      console.error('❌ Error updating student eligibility:', updateError);
      console.error('❌ Error code:', updateError.code);
      console.error('❌ Error message:', updateError.message);
      
      // Check if this is the specific trigger error
      if (updateError.message && (updateError.message.includes('has no field') || updateError.message.includes('column') || updateError.message.includes('trigger'))) {
        console.log('🚨 Database trigger still references dropped columns');
        return res.status(500).json({
          success: false,
          error: 'Database trigger error - dropped columns still referenced',
          details: 'There is a database trigger in Supabase that still references dropped columns. Please go to your Supabase dashboard → Database → Triggers and remove any triggers on the students table that reference old columns.',
          technicalDetails: updateError.message,
          solution: 'Access Supabase Dashboard → Your Project → Database → Triggers → Find and remove triggers referencing dropped columns'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to update student eligibility',
        details: updateError.message
      });
    }
    
    console.log(`✅ Successfully updated eligibility for student ${studentId} to ${eligible}`);
    
    res.status(200).json({
      success: true,
      message: 'Student eligibility updated successfully',
      data: {
        studentId: updatedStudent.student_id,
        studentName: updatedStudent.name,
        eligible: updatedStudent.eligible
      }
    });
    
  } catch (error) {
    console.error('❌ Eligibility update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student eligibility',
      details: error.message
    });
  }
});





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