import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send emails');
  }
});

// Send certificate approval notification
export const sendCertificateApprovalEmail = async (studentEmail, studentName, certificateId, courseName, companyName = 'Certificate Hub') => {
  try {
    // Validate email address
    if (!studentEmail || !studentEmail.includes('@')) {
      throw new Error('Invalid or missing email address');
    }

    const mailOptions = {
      from: {
        name: 'Certificate Hub',
        address: process.env.EMAIL_USER
      },
      to: studentEmail,
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
              <div class="logo">🎓 Certificate Hub</div>
              <div class="success-icon">✅</div>
              <h1 class="title">Certificate Request Approved!</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <div class="highlight">
                <p><strong>Great news!</strong> Your certificate request has been approved by our admin team and is now ready for download.</p>
              </div>

              <div class="certificate-details">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Certificate Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Student Name:</span>
                  <span class="detail-value">${studentName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Course/Program:</span>
                  <span class="detail-value">${courseName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Company:</span>
                  <span class="detail-value">${companyName}</span>
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
                <li>Log in to your Certificate Hub account</li>
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
              <p>This is an automated notification from Certificate Hub.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="margin-top: 15px;">
                <strong>Certificate Hub Team</strong><br>
                Making certification simple and secure
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Certificate approval email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending certificate approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send certificate rejection notification
export const sendCertificateRejectionEmail = async (studentEmail, studentName, courseName, reason = '') => {
  try {
    // Validate email address
    if (!studentEmail || !studentEmail.includes('@')) {
      throw new Error('Invalid or missing email address');
    }

    const mailOptions = {
      from: {
        name: 'Certificate Hub',
        address: process.env.EMAIL_USER
      },
      to: studentEmail,
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
              <div class="logo">🎓 Certificate Hub</div>
              <div class="warning-icon">⚠️</div>
              <h1 class="title">Certificate Request Needs Attention</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <div class="highlight">
                <p>We have reviewed your certificate request for <strong>${courseName}</strong>, and it requires some attention before we can approve it.</p>
              </div>

              ${reason ? `
                <h3 style="color: #dc2626;">📝 Reason for Review:</h3>
                <p style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  ${reason}
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
              <p>This is an automated notification from Certificate Hub.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="margin-top: 15px;">
                <strong>Certificate Hub Team</strong><br>
                Making certification simple and secure
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Certificate rejection email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending certificate rejection email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendCertificateApprovalEmail, sendCertificateRejectionEmail };