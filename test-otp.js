import fetch from 'node-fetch';
import dotenv from 'dotenv';
import supabase from './supabaseClient.js';

dotenv.config();

const BASE_URL = 'http://localhost:3001';

// SMS configuration - exactly matching the working test
const SMS_CONFIG = {
  secret: 'xledocqmXkNPrTesuqWr',
  sender: 'NIGHAI',
  tempid: '1207174264191607433',
  route: 'TA',
  msgtype: '1',
  baseUrl: 'http://43.252.88.250/index.php/smsapi/httpapi/'
};

// Working OTP Service Class - extracted from test-otp.js
export class WorkingOtpService {
  // Generate a 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate Indian phone number format
  static validatePhoneNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(cleanNumber);
  }

  // Format phone number
  static formatPhoneNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
    if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
      return cleanNumber.substring(2);
    }
    return cleanNumber;
  }

  // Check if phone number exists in database (role-specific validation)
  static async validatePhoneInDatabase(phoneNumber, role = null) {
    try {
      // If role is specified, only check the appropriate table
      if (role === 'admin') {
        // Check admin table only
        const { data: adminUser, error: adminError } = await supabase
          .from('admin')
          .select('admin_id, name, phone_number')
          .eq('phone_number', phoneNumber)
          .single();

        if (!adminError && adminUser) {
          return {
            exists: true,
            userType: 'admin',
            user: adminUser
          };
        }

        return {
          exists: false,
          userType: null,
          user: null,
          message: 'Phone number not found in admin records'
        };
      }

      if (role === 'user' || role === 'student') {
        // Check students table only
        const { data: studentUser, error: studentError } = await supabase
          .from('students')
          .select('student_id, name, phone_number')
          .eq('phone_number', phoneNumber)
          .eq('deleted', false)
          .single();

        if (!studentError && studentUser) {
          return {
            exists: true,
            userType: 'student',
            user: studentUser
          };
        }

        return {
          exists: false,
          userType: null,
          user: null,
          message: 'Phone number not found in student records'
        };
      }

      // If no role specified, check both tables (backward compatibility)
      // Check admin table first
      const { data: adminUser, error: adminError } = await supabase
        .from('admin')
        .select('admin_id, name, phone_number')
        .eq('phone_number', phoneNumber)
        .single();

      if (!adminError && adminUser) {
        return {
          exists: true,
          userType: 'admin',
          user: adminUser
        };
      }

      // Check students table
      const { data: studentUser, error: studentError } = await supabase
        .from('students')
        .select('student_id, name, phone_number')
        .eq('phone_number', phoneNumber)
        .eq('deleted', false)
        .single();

      if (!studentError && studentUser) {
        return {
          exists: true,
          userType: 'student',
          user: studentUser
        };
      }

      return {
        exists: false,
        userType: null,
        user: null
      };
    } catch (error) {
      console.error('Error validating phone in database:', error);
      throw error;
    }
  }

  // Store OTP in Supabase database
  static async storeOTP(phoneNumber, otp) {
    try {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Database will handle IST conversion

      // Mark existing OTPs as verified (invalidate them)
      await supabase
        .from('otp_sessions')
        .update({ is_verified: true })
        .eq('phone_number', phoneNumber)
        .eq('is_verified', false);

      // Create new OTP record
      const { data, error } = await supabase
        .from('otp_sessions')
        .insert({
          phone_number: phoneNumber,
          otp_code: otp,
          expires_at: expiresAt,
          is_verified: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing OTP:', error);
        throw new Error(`Failed to store OTP: ${error.message}`);
      }

      console.log(`✅ OTP stored successfully for ${phoneNumber}`);
      return data;
    } catch (error) {
      console.error('Store OTP error:', error);
      throw error;
    }
  }

  // Verify OTP from Supabase database
  static async verifyOTP(phoneNumber, otp) {
    try {
      const { data: otpRecord, error } = await supabase
        .from('otp_sessions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otp)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !otpRecord) {
        console.log(`❌ Invalid or expired OTP for ${phoneNumber}`);
        return { isValid: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as verified
      const { error: updateError } = await supabase
        .from('otp_sessions')
        .update({ is_verified: true })
        .eq('session_id', otpRecord.session_id);

      if (updateError) {
        console.error('Error updating OTP status:', updateError);
        throw new Error(`Failed to update OTP status: ${updateError.message}`);
      }

      console.log(`✅ OTP verified successfully for ${phoneNumber}`);
      return { 
        isValid: true, 
        message: 'OTP verified successfully',
        otpRecord 
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  // Send OTP via SMS - using the exact working logic from test-otp.js
  static async sendOtpSms(phoneNumber, otp) {
    try {
      console.log(`📱 [Working Service] Sending OTP SMS to ${phoneNumber} with OTP: ${otp}`);
      
      // Format the SMS message exactly like the working version
      const message = `Welcome to NighaTech Global Your OTP for authentication is ${otp} don't share with anybody Thank you`;
      
      // Prepare SMS API parameters exactly like the working version
      const params = new URLSearchParams({
        secret: SMS_CONFIG.secret,
        sender: SMS_CONFIG.sender,
        tempid: SMS_CONFIG.tempid,
        receiver: phoneNumber,
        route: SMS_CONFIG.route,
        msgtype: SMS_CONFIG.msgtype,
        sms: message
      });

      const smsUrl = `${SMS_CONFIG.baseUrl}?${params.toString()}`;
      console.log(`📱 [Working Service] SMS URL: ${smsUrl}`);

      // Send SMS using the exact same method as the working test
      const response = await fetch(smsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Node.js SMS Service/1.0'
        }
      });

      const responseText = await response.text();
      console.log(`📱 [Working Service] SMS API Response Status: ${response.status}`);
      console.log(`📱 [Working Service] SMS API Response Text: ${responseText}`);

      if (response.status === 200) {
        console.log(`✅ [Working Service] SMS sent successfully to ${phoneNumber}`);
        return {
          success: true,
          message: `SMS sent successfully to ${phoneNumber}`,
          apiResponse: responseText,
          status: response.status
        };
      } else {
        console.log(`❌ [Working Service] SMS failed for ${phoneNumber}`);
        return {
          success: false,
          error: `SMS API returned status ${response.status}: ${responseText}`,
          apiResponse: responseText,
          status: response.status
        };
      }
    } catch (error) {
      console.error('📱 [Working Service] SMS Service Error:', error);
      return {
        success: false,
        error: `Failed to send SMS: ${error.message}`,
        exception: error.name
      };
    }
  }

  // Complete OTP flow: generate, store, and send (with role-based validation)
  static async sendOTP(phoneNumber, name = null, role = null) {
    try {
      console.log(`📱 [Working Service] Starting OTP process for ${phoneNumber} with role: ${role}`);
      
      // Format and validate phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      if (!this.validatePhoneNumber(formattedPhone)) {
        throw new Error('Invalid phone number format. Must be a valid 10-digit Indian mobile number starting with 6-9');
      }

      // Validate phone number exists in database with role-specific check
      const phoneValidation = await this.validatePhoneInDatabase(formattedPhone, role);
      
      if (!phoneValidation.exists) {
        const roleMessage = role === 'admin' ? 'admin records' : role === 'user' || role === 'student' ? 'student records' : 'database';
        throw new Error(`Phone number not registered in ${roleMessage}. Please contact administrator to register your phone number.`);
      }

      console.log(`📱 [Working Service] Phone number validated for ${phoneValidation.userType}: ${phoneValidation.user.name}`);

      // Generate OTP
      const otp = this.generateOTP();
      console.log(`📱 [Working Service] Generated OTP: ${otp}`);
      
      // Store OTP in database
      await this.storeOTP(formattedPhone, otp);
      
      // Send OTP via SMS using the working method
      const smsResult = await this.sendOtpSms(formattedPhone, otp);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        phoneNumber: formattedPhone,
        userType: phoneValidation.userType,
        smsResult,
        otp: otp // For debugging - remove in production
      };
    } catch (error) {
      console.error('[Working Service] Send OTP error:', error);
      throw error;
    }
  }

  // Cleanup expired OTPs
  static async cleanupExpiredOTPs() {
    try {
      const { data, error } = await supabase
        .from('otp_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error cleaning up expired OTPs:', error);
        throw new Error(`Failed to cleanup expired OTPs: ${error.message}`);
      }

      console.log('✅ Expired OTPs cleaned up successfully');
      return { success: true, message: 'Expired OTPs cleaned up successfully' };
    } catch (error) {
      console.error('Cleanup expired OTPs error:', error);
      throw error;
    }
  }
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    data,
    ok: response.ok
  };
}

// Test functions
async function testSendOTP() {
  console.log('\n🧪 Testing Send OTP...');
  
  const result = await apiCall('/v1/auth/send-otp', 'POST', {
    phoneNumber: TEST_PHONE
  });
  
  console.log('📱 Send OTP Result:', {
    status: result.status,
    success: result.data.success,
    message: result.data.message,
    phoneNumber: result.data.phoneNumber,
    userExists: result.data.userExists
  });
  
  return result.ok;
}

async function testVerifyOTP() {
  console.log('\n🧪 Testing Verify OTP...');
  
  // You'll need to manually enter the OTP received via SMS
  const otp = process.argv[2]; // Pass OTP as command line argument
  
  if (!otp) {
    console.log('❌ Please provide OTP as command line argument: node test-otp.js <OTP>');
    return false;
  }
  
  const result = await apiCall('/v1/auth/verify-otp', 'POST', {
    phoneNumber: TEST_PHONE,
    otp: otp
  });
  
  console.log('🔐 Verify OTP Result:', {
    status: result.status,
    success: result.data.success,
    message: result.data.message,
    isNewUser: result.data.isNewUser,
    user: result.data.user,
    access_token: result.data.access_token ? 'Generated' : 'Not generated'
  });
  
  return result.ok ? result.data.access_token : null;
}

async function testGetProfile(accessToken) {
  console.log('\n🧪 Testing Get Profile...');
  
  if (!accessToken) {
    console.log('❌ No access token available');
    return false;
  }
  
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  };
  
  const response = await fetch(`${BASE_URL}/v1/auth/profile`, options);
  const data = await response.json();
  
  const result = {
    status: response.status,
    data,
    ok: response.ok
  };
  
  console.log('👤 Get Profile Result:', {
    status: result.status,
    success: result.data.success,
    user: result.data.user
  });
  
  return result.ok;
}

async function testUpdateProfile(accessToken) {
  console.log('\n🧪 Testing Update Profile...');
  
  if (!accessToken) {
    console.log('❌ No access token available');
    return false;
  }
  
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: 'Updated Test User'
    })
  };
  
  const response = await fetch(`${BASE_URL}/v1/auth/profile`, options);
  const data = await response.json();
  
  const result = {
    status: response.status,
    data,
    ok: response.ok
  };
  
  console.log('✏️ Update Profile Result:', {
    status: result.status,
    success: result.data.success,
    message: result.data.message,
    user: result.data.user
  });
  
  return result.ok;
}

async function testHealthCheck() {
  console.log('\n🧪 Testing Health Check...');
  
  const result = await apiCall('/health');
  
  console.log('🏥 Health Check Result:', {
    status: result.status,
    serverStatus: result.data.status,
    supabaseStatus: result.data.supabase?.status,
    timestamp: result.data.timestamp
  });
  
  return result.ok;
}

async function testCleanupOTPs() {
  console.log('\n🧪 Testing Cleanup OTPs...');
  
  const result = await apiCall('/v1/auth/cleanup-otps', 'POST');
  
  console.log('🧹 Cleanup OTPs Result:', {
    status: result.status,
    success: result.data.success,
    message: result.data.message
  });
  
  return result.ok;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting OTP System Tests...');
  console.log(`📱 Test Phone Number: ${TEST_PHONE}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  try {
    // Test health check first
    await testHealthCheck();
    
    // Test send OTP
    const sendOtpSuccess = await testSendOTP();
    
    if (!sendOtpSuccess) {
      console.log('❌ Send OTP failed, stopping tests');
      return;
    }
    
    console.log('\n⏳ Please check your phone for the OTP and run:');
    console.log(`node test-otp.js <YOUR_OTP>`);
    
    // If OTP is provided, continue with verification tests
    if (process.argv[2]) {
      const accessToken = await testVerifyOTP();
      
      if (accessToken) {
        await testGetProfile(accessToken);
        await testUpdateProfile(accessToken);
      }
      
      // Test cleanup
      await testCleanupOTPs();
    }
    
    console.log('\n✅ Tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Export the main functions for external use
export { runTests, testSendOTP, testVerifyOTP, apiCall };

// Note: Tests are now only run from run-otp-tests.js
// This module is now a pure service module
