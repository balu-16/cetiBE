import express from 'express';
import { sendCertificateApprovalEmail, sendCertificateRejectionEmail } from '../services/emailService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateRequired, validateEmailField, sanitizeInput } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Test endpoint for email functionality
router.post('/test', 
  validateEmailField('email'),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    logger.info('Sending test email', { email });

    await sendCertificateApprovalEmail(
      email,
      'Test Student',
      'TEST123',
      'Test Course',
      'Test Company'
    );

    logger.info('Test email sent successfully', { email });
    return ApiResponse.success(res, { sentTo: email }, 'Test email sent successfully');
  })
);

// Send certificate approval email
router.post('/certificate-approval',
  validateRequired(['studentEmail', 'studentName', 'studentId', 'courseName', 'companyName']),
  validateEmailField('studentEmail'),
  asyncHandler(async (req, res) => {
    const { studentEmail, studentName, studentId, courseName, companyName } = req.body;

    logger.info('Sending certificate approval email', { 
      studentEmail, 
      studentName, 
      studentId, 
      courseName, 
      companyName 
    });

    await sendCertificateApprovalEmail(studentEmail, studentName, studentId, courseName, companyName);

    logger.info('Certificate approval email sent successfully', { studentEmail, studentId });
    return ApiResponse.success(res, { sentTo: studentEmail }, 'Certificate approval email sent successfully');
  })
);

// Send certificate rejection email
router.post('/certificate-rejection',
  validateRequired(['studentEmail', 'studentName']),
  validateEmailField('studentEmail'),
  asyncHandler(async (req, res) => {
    const { studentEmail, studentName, reason } = req.body;

    logger.info('Sending certificate rejection email', { 
      studentEmail, 
      studentName, 
      reason: reason || 'No reason provided' 
    });

    await sendCertificateRejectionEmail(studentEmail, studentName, reason);

    logger.info('Certificate rejection email sent successfully', { studentEmail });
    return ApiResponse.success(res, { sentTo: studentEmail }, 'Certificate rejection email sent successfully');
  })
);

export default router;