import express from 'express';
import { WorkingOtpService } from '../test-otp.js';

const router = express.Router();

// Send SMS endpoint
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    console.log('📱 SMS send endpoint called');
    console.log('📱 Request body:', req.body);
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    // Format phone number
    const formattedPhone = WorkingOtpService.formatPhoneNumber(phoneNumber);

    // Validate phone number
    if (!WorkingOtpService.validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6-9'
      });
    }

    // Use the SMS functionality from WorkingOtpService
    // Generate a dummy OTP for SMS sending (we'll use the message instead)
    const smsResult = await WorkingOtpService.sendOtpSms(formattedPhone, message);

    if (!smsResult.success) {
      console.error('❌ SMS sending failed:', smsResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send SMS',
        details: smsResult.error
      });
    }

    console.log('✅ SMS sent successfully');
    
    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      phoneNumber: formattedPhone,
      smsDetails: smsResult
    });
    
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: error.message
    });
  }
});

export default router;