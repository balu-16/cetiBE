import dotenv from 'dotenv';
import { sendTestEmail, sendCertificateApprovalEmail, sendCertificateRejectionEmail } from './services/emailService.js';

// Load environment variables
dotenv.config();

const TEST_EMAIL = 'balarakeshg16@gmail.com';

async function testEmailSending() {
  console.log('🧪 Starting Email Service Test');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Send Test Email
    console.log('\n📧 Test 1: Sending Test Email');
    console.log(`📍 Target Email: ${TEST_EMAIL}`);
    
    const testResult = await sendTestEmail(TEST_EMAIL);
    console.log('✅ Test email sent successfully!');
    console.log('📊 Result:', testResult);
    
    // Test 2: Send Certificate Approval Email
    console.log('\n📧 Test 2: Sending Certificate Approval Email');
    
    const approvalResult = await sendCertificateApprovalEmail(
      TEST_EMAIL,
      'Bala Rakesh',
      'CERT-TEST-001',
      'Full Stack Development',
      'Nigha Tech Global'
    );
    console.log('✅ Certificate approval email sent successfully!');
    console.log('📊 Result:', approvalResult);
    
    // Test 3: Send Certificate Rejection Email
    console.log('\n📧 Test 3: Sending Certificate Rejection Email');
    
    const rejectionResult = await sendCertificateRejectionEmail(
      TEST_EMAIL,
      'Bala Rakesh',
      'Full Stack Development',
      'Missing required documentation'
    );
    console.log('✅ Certificate rejection email sent successfully!');
    console.log('📊 Result:', rejectionResult);
    
    console.log('\n🎉 All email tests completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('\n❌ Email test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Initializing Email Test Suite...');
testEmailSending();