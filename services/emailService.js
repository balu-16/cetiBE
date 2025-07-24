import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate email configuration
const validateEmailConfig = () => {
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(', ')}`);
  }
  
  if (!process.env.EMAIL_USER.includes('@')) {
    throw new Error('EMAIL_USER must be a valid email address');
  }
};

// Validate configuration on startup
try {
  validateEmailConfig();
  console.log('✅ Email configuration validated successfully');
} catch (error) {
  console.error('❌ Email configuration error:', error.message);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Create transporter using company SMTP settings
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Additional security options for better compatibility
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      // Connection timeout
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    throw error;
  }
};

const transporter = createTransporter();

// Verify transporter configuration with better error handling
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    return false;
  }
};

// Verify on startup (non-blocking)
verifyTransporter().catch(err => {
  console.error('❌ Email verification failed during startup:', err.message);
});

// Send certificate approval notification
export const sendCertificateApprovalEmail = async (studentEmail, studentName, certificateId, courseName, companyName = 'Nigha Tech Global') => {
  try {
    // Validate inputs
    if (!studentEmail || typeof studentEmail !== 'string' || !studentEmail.includes('@')) {
      throw new Error('Invalid or missing email address');
    }
    
    if (!studentName || typeof studentName !== 'string' || studentName.trim().length === 0) {
      throw new Error('Invalid or missing student name');
    }
    
    if (!certificateId) {
      throw new Error('Invalid or missing certificate ID');
    }
    
    if (!courseName || typeof courseName !== 'string' || courseName.trim().length === 0) {
      throw new Error('Invalid or missing course name');
    }

    // Sanitize inputs
    const sanitizedEmail = studentEmail.trim().toLowerCase();
    const sanitizedName = studentName.trim();
    const sanitizedCourse = courseName.trim();
    const sanitizedCompany = companyName ? companyName.trim() : 'Nigha Tech Global';

    const mailOptions = {
      from: {
        name: 'Nigha Tech Global',
        address: process.env.EMAIL_USER
      },
      to: sanitizedEmail,
      subject: '🎉 Certificate Request Approved - Ready for Download!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificate Approved</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e9ecef;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .success-icon {
              font-size: 48px;
              margin: 20px 0;
            }
            .title {
              color: #1e40af;
              font-size: 28px;
              margin: 20px 0;
              font-weight: bold;
            }
            .content {
              margin: 20px 0;
              font-size: 16px;
            }
            .highlight {
              background-color: #dbeafe;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #2563eb;
            }
            .certificate-details {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-label {
              font-weight: bold;
              color: #475569;
            }
            .detail-value {
              color: #1e293b;
            }
            .cta-button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              color: #92400e;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 Nigha Tech Global</div>
              <div class="success-icon">✅</div>
              <h1 class="title">Certificate Request Approved!</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${sanitizedName}</strong>,</p>
              
              <div class="highlight">
                <p><strong>Great news!</strong> Your certificate request has been approved by our admin team and is now ready for download.</p>
              </div>

              <div class="certificate-details">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Certificate Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Student Name:</span>
                  <span class="detail-value">${sanitizedName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Course/Program:</span>
                  <span class="detail-value">${sanitizedCourse}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Company:</span>
                  <span class="detail-value">${sanitizedCompany}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Certificate ID:</span>
                  <span class="detail-value">${certificateId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Approval Date:</span>
                  <span class="detail-value">${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              <h3 style="color: #1e40af;">📥 How to Download Your Certificate:</h3>
              <ol style="padding-left: 20px;">
                <li>Log in to your Nigha Tech Global portal</li>
                <li>Navigate to the <strong>"Downloads"</strong> section</li>
                <li>Find your approved certificate</li>
                <li>Click the download button to get your PDF certificate</li>
              </ol>

              <div class="warning">
                <strong>⚠️ Important:</strong> Please download your certificate as soon as possible. Keep a backup copy in a safe place for your records.
              </div>

              <p>Congratulations on completing your program! Your certificate is a testament to your hard work and dedication.</p>
            </div>

            <div class="footer">
              <p>This is an automated notification from Nigha Tech Global.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="margin-top: 15px;">
                <strong>Nigha Tech Global Team</strong><br>
                Making certification simple and secure
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email with retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Certificate approval email sent successfully (attempt ${attempt}):`, result.messageId);
        return { success: true, messageId: result.messageId, attempt };
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Email send attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All attempts failed
    throw lastError;
    
  } catch (error) {
    console.error('❌ Error sending certificate approval email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send certificate rejection notification
export const sendCertificateRejectionEmail = async (studentEmail, studentName, courseName, reason = '') => {
  try {
    // Validate inputs
    if (!studentEmail || typeof studentEmail !== 'string' || !studentEmail.includes('@')) {
      throw new Error('Invalid or missing email address');
    }
    
    if (!studentName || typeof studentName !== 'string' || studentName.trim().length === 0) {
      throw new Error('Invalid or missing student name');
    }
    
    if (!courseName || typeof courseName !== 'string' || courseName.trim().length === 0) {
      throw new Error('Invalid or missing course name');
    }

    // Sanitize inputs
    const sanitizedEmail = studentEmail.trim().toLowerCase();
    const sanitizedName = studentName.trim();
    const sanitizedCourse = courseName.trim();
    const sanitizedReason = reason ? reason.trim() : '';

    const mailOptions = {
      from: {
        name: 'Nigha Tech Global',
        address: process.env.EMAIL_USER
      },
      to: sanitizedEmail,
      subject: '📋 Certificate Request Update - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificate Request Update</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e9ecef;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .warning-icon {
              font-size: 48px;
              margin: 20px 0;
            }
            .title {
              color: #dc2626;
              font-size: 28px;
              margin: 20px 0;
              font-weight: bold;
            }
            .content {
              margin: 20px 0;
              font-size: 16px;
            }
            .highlight {
              background-color: #fef2f2;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #dc2626;
            }
            .next-steps {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #0ea5e9;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 Nigha Tech Global</div>
              <div class="warning-icon">⚠️</div>
              <h1 class="title">Certificate Request Needs Attention</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${sanitizedName}</strong>,</p>
              
              <div class="highlight">
                <p>We have reviewed your certificate request for <strong>${sanitizedCourse}</strong>, and it requires some attention before we can approve it.</p>
              </div>

              ${sanitizedReason ? `
                <h3 style="color: #dc2626;">📝 Reason for Review:</h3>
                <p style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  ${sanitizedReason}
                </p>
              ` : ''}

              <div class="next-steps">
                <h3 style="margin-top: 0; color: #0ea5e9;">🔄 Next Steps:</h3>
                <ol style="padding-left: 20px;">
                  <li>Please review your certificate request details</li>
                  <li>Make any necessary corrections or updates</li>
                  <li>Contact our support team if you need assistance</li>
                  <li>Resubmit your request when ready</li>
                </ol>
              </div>

              <p>Don't worry - this is a common part of the process to ensure all certificates meet our quality standards. Our team is here to help you get your certificate approved.</p>
            </div>

            <div class="footer">
              <p>This is an automated notification from Nigha Tech Global.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="margin-top: 15px;">
                <strong>Nigha Tech Global Team</strong><br>
                Making certification simple and secure
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email with retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Certificate rejection email sent successfully (attempt ${attempt}):`, result.messageId);
        return { success: true, messageId: result.messageId, attempt };
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Email send attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All attempts failed
    throw lastError;
    
  } catch (error) {
    console.error('❌ Error sending certificate rejection email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send a test email to verify email functionality
 * @param {string} email - Recipient email address
 * @returns {Promise<Object>} Result object with success status and details
 */
export const sendTestEmail = async (email) => {
  try {
    // Validate input
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email address is required');
    }

    // Sanitize input
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('Invalid email format');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Nigha Tech Global'}" <${process.env.EMAIL_USER}>`,
      to: sanitizedEmail,
      subject: 'Test Email - Email Service Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .success-icon { font-size: 48px; color: #4CAF50; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Email Service Test</h1>
              <p>This is a test email to verify email functionality</p>
            </div>
            <div class="content">
              <h2>Test Successful!</h2>
              <p>If you're reading this email, it means our email service is working correctly.</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Sent to: ${sanitizedEmail}</li>
                <li>Timestamp: ${new Date().toISOString()}</li>
                <li>Service: Nigha Tech Global Email System</li>
              </ul>
              <p>This email was sent automatically as part of our system verification process.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nigha Tech Global. All rights reserved.</p>
              <p>This is an automated test email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Retry logic with exponential backoff
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempting to send test email (attempt ${attempt}/3) to: ${sanitizedEmail}`);
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`Test email sent successfully on attempt ${attempt}:`, {
          messageId: info.messageId,
          response: info.response,
          to: sanitizedEmail
        });

        return {
          success: true,
          messageId: info.messageId,
          attempt: attempt,
          response: info.response
        };

      } catch (error) {
        lastError = error;
        console.error(`Test email attempt ${attempt} failed:`, {
          error: error.message,
          code: error.code,
          to: sanitizedEmail
        });

        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    console.error('All test email attempts failed:', {
      error: lastError.message,
      code: lastError.code,
      to: sanitizedEmail
    });

    return {
      success: false,
      error: lastError.message,
      code: lastError.code
    };

  } catch (error) {
    console.error('Test email validation error:', {
      error: error.message,
      email: email
    });

    return {
      success: false,
      error: error.message
    };
  }
};

export default { sendCertificateApprovalEmail, sendCertificateRejectionEmail, sendTestEmail, verifyTransporter };