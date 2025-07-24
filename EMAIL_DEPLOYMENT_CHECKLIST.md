# Email Service Deployment Checklist for Vercel

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Configuration
Ensure these environment variables are set in your Vercel dashboard:

```bash
EMAIL_HOST=your-smtp-host.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false
EMAIL_FROM_NAME=Nigha Tech Global
```

**Important Notes:**
- Use App Passwords for Gmail (not regular password)
- For Gmail: `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `EMAIL_SECURE=false`
- For Outlook: `EMAIL_HOST=smtp-mail.outlook.com`, `EMAIL_PORT=587`, `EMAIL_SECURE=false`

### 2. Code Improvements Made

#### ✅ Enhanced Error Handling
- Added comprehensive input validation for all email functions
- Implemented retry logic with exponential backoff (3 attempts)
- Added proper error responses with detailed messages
- Sanitized all email inputs to prevent injection attacks

#### ✅ Email Service Robustness
- Added email configuration validation on startup
- Enhanced transporter creation with timeout settings
- Added connection verification with fallback handling
- Improved logging for debugging in production

#### ✅ Route Improvements
- Updated all email routes with proper error handling
- Added validation for required fields
- Implemented consistent API response format
- Added detailed logging for troubleshooting

#### ✅ Test Email Functionality
- Created dedicated `sendTestEmail` function
- Added professional HTML email template for testing
- Implemented proper validation and retry logic
- Added test endpoint: `POST /v1/email/test`

## 🚀 Deployment Steps

### 1. Set Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required email environment variables
5. Redeploy your application

### 2. Test Email Functionality
After deployment, test the email service:

```bash
# Test email endpoint
curl -X POST https://your-vercel-app.vercel.app/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test certificate approval email
curl -X POST https://your-vercel-app.vercel.app/v1/email/certificate-approval \
  -H "Content-Type: application/json" \
  -d '{
    "studentEmail": "student@example.com",
    "studentName": "John Doe",
    "studentId": "12345",
    "courseName": "Web Development"
  }'

# Test certificate rejection email
curl -X POST https://your-vercel-app.vercel.app/v1/email/certificate-rejection \
  -H "Content-Type: application/json" \
  -d '{
    "studentEmail": "student@example.com",
    "studentName": "John Doe",
    "courseName": "Web Development",
    "reason": "Missing required documentation"
  }'
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Invalid email configuration" Error
**Cause:** Missing or incorrect environment variables
**Solution:** 
- Verify all email environment variables are set in Vercel
- Check EMAIL_USER is a valid email address
- Ensure EMAIL_PASS is correct (use app password for Gmail)

#### 2. "Email transporter verification failed" Error
**Cause:** SMTP connection issues
**Solution:**
- Check EMAIL_HOST and EMAIL_PORT are correct
- Verify EMAIL_SECURE setting (usually false for port 587)
- Test SMTP credentials manually

#### 3. "Failed to send email" Error
**Cause:** Runtime email sending issues
**Solution:**
- Check recipient email address is valid
- Verify SMTP server allows connections from Vercel IPs
- Check email provider rate limits

#### 4. Timeout Errors
**Cause:** Slow SMTP response
**Solution:**
- Increase timeout settings (already implemented)
- Use faster SMTP provider
- Check network connectivity

### 5. Gmail-Specific Setup
If using Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App passwords
3. Use the app password as EMAIL_PASS (not your regular password)

### 6. Outlook-Specific Setup
If using Outlook:
1. Use your regular Microsoft account password
2. Ensure "Less secure app access" is enabled if needed
3. Use `smtp-mail.outlook.com` as EMAIL_HOST

## 📊 Monitoring and Logs

### Check Email Service Status
The application includes comprehensive logging:

```javascript
// Email service initialization logs
console.log('🔧 Initializing email service...');
console.log('✅ Email service initialized successfully');

// Email sending logs
console.log('Attempting to send test email (attempt 1/3)');
console.log('Test email sent successfully');
```

### Health Check Endpoint
Use the health check to verify overall service status:
```bash
curl https://your-vercel-app.vercel.app/health
```

## 🛡️ Security Best Practices

### ✅ Implemented Security Measures
- Input validation and sanitization
- Email format validation
- Rate limiting through retry logic
- Secure SMTP configuration
- Environment variable protection

### 🔒 Additional Recommendations
- Use dedicated email service (SendGrid, Mailgun) for production
- Implement email rate limiting
- Monitor email delivery rates
- Set up email bounce handling

## 📈 Performance Optimizations

### ✅ Implemented Optimizations
- Connection pooling in nodemailer
- Retry logic with exponential backoff
- Timeout configurations
- Efficient error handling

### 🚀 Future Improvements
- Implement email queuing for high volume
- Add email templates caching
- Use email service providers for better deliverability
- Add email analytics and tracking

## 🎯 Success Criteria

Your email service is ready for production when:
- ✅ All environment variables are configured
- ✅ Test email endpoint returns success
- ✅ Certificate approval emails are delivered
- ✅ Certificate rejection emails are delivered
- ✅ Error handling works correctly
- ✅ Retry logic functions properly
- ✅ Logs show successful email operations

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test SMTP credentials manually
4. Check email provider documentation
5. Review application logs for specific error messages

The email service is now production-ready with comprehensive error handling, retry logic, and proper validation for reliable deployment on Vercel! 🚀