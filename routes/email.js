import express from 'express';
import { sendCertificateApprovalEmail, sendCertificateRejectionEmail, sendTestEmail } from '../services/emailService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateRequired, validateEmailField, sanitizeInput } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Test endpoint for email functionality
router.post('/test', 
  validateRequired(['email']),
  validateEmailField('email'),
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    logger.info('Sending test email', { email });

    try {
      const result = await sendTestEmail(email);

      if (!result.success) {
        logger.error('Failed to send test email', { 
          email, 
          error: result.error 
        });
        return ApiResponse.error(res, `Failed to send test email: ${result.error}`, 500);
      }

      logger.info('Test email sent successfully', { 
        email, 
        messageId: result.messageId 
      });
      
      return ApiResponse.success(res, { 
        sentTo: email, 
        messageId: result.messageId 
      }, 'Test email sent successfully');
      
    } catch (error) {
      logger.error('Unexpected error sending test email', { 
        email, 
        error: error.message 
      });
      return ApiResponse.error(res, 'Internal server error while sending test email', 500);
    }
  })
);

// Send certificate approval email
router.post('/certificate-approval',
  validateRequired(['studentEmail', 'studentName', 'studentId', 'courseName']),
  validateEmailField('studentEmail'),
  asyncHandler(async (req, res) => {
    const { studentEmail, studentName, studentId, courseName, companyName } = req.body;

    // Additional validation
    if (!studentId || (typeof studentId !== 'string' && typeof studentId !== 'number')) {
      return ApiResponse.error(res, 'Invalid student ID format', 400);
    }

    logger.info('Sending certificate approval email', { 
      studentEmail, 
      studentName, 
      studentId, 
      courseName, 
      companyName: companyName || 'Nigha Tech Global'
    });

    try {
      const result = await sendCertificateApprovalEmail(
        studentEmail, 
        studentName, 
        studentId, 
        courseName, 
        companyName || 'Nigha Tech Global'
      );

      if (!result.success) {
        logger.error('Failed to send certificate approval email', { 
          studentEmail, 
          studentId, 
          error: result.error 
        });
        return ApiResponse.error(res, `Failed to send email: ${result.error}`, 500);
      }

      logger.info('Certificate approval email sent successfully', { 
        studentEmail, 
        studentId, 
        messageId: result.messageId,
        attempt: result.attempt 
      });
      
      return ApiResponse.success(res, { 
        sentTo: studentEmail, 
        messageId: result.messageId,
        attempt: result.attempt 
      }, 'Certificate approval email sent successfully');
      
    } catch (error) {
      logger.error('Unexpected error sending certificate approval email', { 
        studentEmail, 
        studentId, 
        error: error.message 
      });
      return ApiResponse.error(res, 'Internal server error while sending email', 500);
    }
  })
);

// Send certificate rejection email
router.post('/certificate-rejection',
  validateRequired(['studentEmail', 'studentName', 'courseName']),
  validateEmailField('studentEmail'),
  asyncHandler(async (req, res) => {
    const { studentEmail, studentName, courseName, reason } = req.body;

    logger.info('Sending certificate rejection email', { 
      studentEmail, 
      studentName, 
      courseName,
      reason: reason || 'No reason provided' 
    });

    try {
      const result = await sendCertificateRejectionEmail(
        studentEmail, 
        studentName, 
        courseName, 
        reason
      );

      if (!result.success) {
        logger.error('Failed to send certificate rejection email', { 
          studentEmail, 
          error: result.error 
        });
        return ApiResponse.error(res, `Failed to send email: ${result.error}`, 500);
      }

      logger.info('Certificate rejection email sent successfully', { 
        studentEmail, 
        messageId: result.messageId,
        attempt: result.attempt 
      });
      
      return ApiResponse.success(res, { 
        sentTo: studentEmail, 
        messageId: result.messageId,
        attempt: result.attempt 
      }, 'Certificate rejection email sent successfully');
      
    } catch (error) {
      logger.error('Unexpected error sending certificate rejection email', { 
        studentEmail, 
        error: error.message 
      });
      return ApiResponse.error(res, 'Internal server error while sending email', 500);
    }
  })
);

export default router;