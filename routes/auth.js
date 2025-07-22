import express from 'express';
import { WorkingOtpService } from '../test-otp.js';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Send OTP endpoint - Fixed to allow signup for new users
router.post('/send-otp', async (req, res) => {
  console.log('📱 Send OTP endpoint called');
  console.log('📱 Request body:', req.body);

  try {
    const { phoneNumber, name, role } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        message: 'Phone number must be provided'
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

    // Send OTP using the WorkingOtpService with role-based validation
    console.log(`📱 Using WorkingOtpService for ${formattedPhone} with role: ${role}`);
    const result = await WorkingOtpService.sendOTP(formattedPhone, name, role);

    console.log(`📱 WorkingOtpService Result:`, result);

    // Check if the OTP service returned an error (e.g., phone validation failed)
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send OTP',
        message: result.message || 'OTP sending failed'
      });
    }

    // Check if SMS was sent successfully
    const smsSuccess = result.smsResult && result.smsResult.success;

    if (!smsSuccess) {
      console.error(`❌ SMS failed but OTP was stored in database for ${formattedPhone}`);
      console.error(`❌ SMS Error:`, result.smsResult);
    }

    const message = 'OTP sent successfully for authentication';

    res.status(200).json({
      success: true,
      message: smsSuccess ? message : `${message} (SMS delivery may have failed)`,
      phoneNumber: formattedPhone,
      smsStatus: smsSuccess,
      smsDetails: result.smsResult || { success: false, error: 'SMS service unavailable' },
      debug: {
        generatedOtp: result.otp, // For debugging - remove in production
        service: 'WorkingOtpService'
      }
    });

  } catch (error) {
    console.error('📱 Send OTP error:', error);
    
    // Check if it's a phone validation error (user not registered)
    if (error.message.includes('Phone number not registered')) {
      return res.status(400).json({
        success: false,
        error: 'Phone number not registered',
        message: error.message
      });
    }
    
    // Other server errors
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      message: error.message
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  console.log('🔐 Verify OTP endpoint called');
  console.log('🔐 Request body:', req.body);

  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required',
        message: 'Both phone number and OTP must be provided'
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

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP format',
        message: 'OTP must be a 6-digit number'
      });
    }

    // Verify OTP using the restored OTP service
    const otpResult = await WorkingOtpService.verifyOTP(formattedPhone, otp);

    if (!otpResult.isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired OTP',
        message: otpResult.message
      });
    }

    // Check if user exists in any of the user tables
    let user = null;
    let userType = null;
    let isNewUser = false;
    let message = '';

    // Check admin table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single();

    if (!adminError && adminUser) {
      user = adminUser;
      userType = 'admin';
      message = 'Admin login successful';
      console.log(`✅ Admin logged in: ${user.name}`);
    }

    // Check students table if not found in admin
    if (!user) {
      const { data: studentUser, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('deleted', false)
        .single();

      if (!studentError && studentUser) {
        user = studentUser;
        userType = 'student';
        message = 'Student login successful';
        console.log(`✅ Student logged in: ${user.name}`);
      }
    }

    // If user doesn't exist in any table, return error
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Phone number not registered. Please contact administrator to register your phone number.'
      });
    }

    // Generate a simple session token (in production, use JWT)
    const userId = userType === 'admin' ? user.admin_id : user.student_id;
    const sessionToken = `session_${userId}_${Date.now()}`;

    // Log login activity
    const loginLogTable = userType === 'admin' ? 'admin_login_logs' : 'student_login_logs';
    const loginLogField = userType === 'admin' ? 'admin_id' : 'student_id';
    
    const { error: loginLogError } = await supabase
      .from(loginLogTable)
      .insert({
        [loginLogField]: userId,
        login_time: new Date().toISOString()
      });
    
    if (loginLogError) {
      console.error('Failed to log login activity:', loginLogError);
    }

    res.status(200).json({
      success: true,
      message,
      isNewUser,
      userType,
      user: {
        id: userId,
        phoneNumber: user.phone_number,
        name: user.name,
        email: user.email || null,
        createdAt: user.created_at,
        role: userType
      },
      sessionToken,
      otpVerified: true
    });

  } catch (error) {
    console.error('🔐 Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'OTP verification failed',
      message: error.message
    });
  }
});

// Get user profile endpoint (requires session token)
router.get('/profile/:sessionToken', async (req, res) => {
  console.log('👤 Get profile endpoint called');

  try {
    const { sessionToken } = req.params;

    if (!sessionToken || !sessionToken.startsWith('session_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token',
        message: 'Valid session token is required'
      });
    }

    // Extract user ID from session token
    const parts = sessionToken.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token format',
        message: 'Session token format is invalid'
      });
    }

    const userId = parts[1];

    // Try to find user in admin table first
    let user = null;
    let userType = null;
    
    const { data: adminUser, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('admin_id', userId)
      .single();

    if (!adminError && adminUser) {
      user = adminUser;
      userType = 'admin';
    } else {
      // Try students table
      const { data: studentUser, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', userId)
        .eq('deleted', false)
        .single();

      if (!studentError && studentUser) {
        user = studentUser;
        userType = 'student';
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    const responseUserId = userType === 'admin' ? user.admin_id : user.student_id;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      userType,
      user: {
        id: responseUserId,
        phoneNumber: user.phone_number,
        name: user.name,
        email: user.email || null,
        createdAt: user.created_at,
        role: userType
      }
    });

  } catch (error) {
    console.error('👤 Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

// Update user profile endpoint
router.put('/profile/:sessionToken', async (req, res) => {
  console.log('✏️ Update profile endpoint called');

  try {
    const { sessionToken } = req.params;
    const { name } = req.body;

    if (!sessionToken || !sessionToken.startsWith('session_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token',
        message: 'Valid session token is required'
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid name',
        message: 'Name must be at least 2 characters long'
      });
    }

    // Extract user ID from session token
    const parts = sessionToken.split('_');
    const userId = parts[1];

    // Find user first to determine table
    let user = null;
    let userType = null;
    let updatedUser = null;
    
    // Try admin table first
    const { data: adminUser, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('admin_id', userId)
      .single();

    if (!adminError && adminUser) {
      userType = 'admin';
      const { data: updated, error: updateError } = await supabase
        .from('admin')
        .update({ name: name.trim() })
        .eq('admin_id', userId)
        .select()
        .single();
        
      if (updateError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update admin profile',
          message: updateError.message
        });
      }
      updatedUser = updated;
    } else {
      // Try students table
      const { data: studentUser, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', userId)
        .eq('deleted', false)
        .single();

      if (!studentError && studentUser) {
        userType = 'student';
        const { data: updated, error: updateError } = await supabase
          .from('students')
          .update({ name: name.trim() })
          .eq('student_id', userId)
          .select()
          .single();
          
        if (updateError) {
          return res.status(500).json({
            success: false,
            error: 'Failed to update student profile',
            message: updateError.message
          });
        }
        updatedUser = updated;
        
        // Student name updated in database only
      } else {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found'
        });
      }
    }

    const responseUserId = userType === 'admin' ? updatedUser.admin_id : updatedUser.student_id;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      userType,
      user: {
        id: responseUserId,
        phoneNumber: updatedUser.phone_number,
        name: updatedUser.name,
        email: updatedUser.email || null,
        createdAt: updatedUser.created_at,
        role: userType
      }
    });

  } catch (error) {
    console.error('✏️ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Cleanup expired OTPs endpoint (admin utility)
router.post('/cleanup-otps', async (req, res) => {
  console.log('🧹 Cleanup OTPs endpoint called');

  try {
    await WorkingOtpService.cleanupExpiredOTPs();

    res.status(200).json({
      success: true,
      message: 'Expired OTPs cleaned up successfully'
    });

  } catch (error) {
    console.error('🧹 Cleanup OTPs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup expired OTPs',
      message: error.message
    });
  }
});

export default router;