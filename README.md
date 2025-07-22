# GPS Certificate Hub Backend

A robust backend system for managing GPS certificate requests, approvals, and email notifications.

## 🚀 Features

- **Certificate Management**: Generate, approve, and download certificates
- **Email Notifications**: Automated email notifications for certificate approvals/rejections
- **OTP Authentication**: Secure authentication system
- **SMS Integration**: SMS notifications support
- **Comprehensive Logging**: Structured logging with file output
- **Input Validation**: Robust input validation and sanitization
- **Error Handling**: Centralized error handling with proper HTTP status codes

## 📋 Prerequisites

- Node.js (v16 or higher)
- Supabase account and project
- Gmail account for email notifications

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gps-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy `.env.example` to `.env` and configure:
   ```env
   # Database Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   
   # Email Configuration
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   LOG_LEVEL=INFO
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   
   # Debug mode
   npm run dev:debug
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Health Check
```http
GET /health
```

### Authentication
```http
POST /v1/auth/login
POST /v1/auth/verify-otp
```

### Students
```http
GET /v1/students
GET /v1/students/:id
```

### Certificates
```http
POST /v1/certificates/generate/:studentId
GET /v1/certificates/download/:studentId
GET /v1/certificates/status/:studentId
```

### Email Notifications
```http
POST /v1/email/test
POST /v1/email/certificate-approval
POST /v1/email/certificate-rejection
```

#### Email Approval Request Body
```json
{
  "studentEmail": "student@example.com",
  "studentName": "John Doe",
  "studentId": "STU123",
  "courseName": "Web Development",
  "companyName": "Tech Corp"
}
```

#### Email Rejection Request Body
```json
{
  "studentEmail": "student@example.com",
  "studentName": "John Doe",
  "reason": "Incomplete requirements"
}
```

### SMS
```http
POST /v1/sms/send
```

## 🏗️ Project Structure

```
gps-backend/
├── config/
│   └── config.js              # Environment configuration
├── middleware/
│   ├── errorHandler.js        # Error handling middleware
│   └── validation.js          # Input validation middleware
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── certificates.js       # Certificate management routes
│   ├── email.js              # Email notification routes
│   └── sms.js                # SMS routes
├── services/
│   └── emailService.js       # Email service implementation
├── utils/
│   ├── apiResponse.js        # Standardized API responses
│   └── logger.js             # Logging utility
├── logs/                     # Log files (auto-created)
├── .env                      # Environment variables
├── index.js                  # Main server file
└── package.json              # Dependencies and scripts
```

## 🔧 Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start with debugging enabled
npm run dev:debug

# Test email functionality
npm run test:email

# Test SMS functionality
npm run test:sms

# Check environment configuration
npm run env:check

# View logs in real-time
npm run logs

# Clean log files
npm run clean:logs

# Health check
npm run health
```

## 📝 Logging

The application uses a comprehensive logging system:

- **Console Output**: Colored logs for development
- **File Output**: JSON-formatted logs in production
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Request Logging**: Automatic HTTP request/response logging

Log files are stored in the `logs/` directory with daily rotation.

## 🛡️ Security Features

- **Input Sanitization**: All inputs are sanitized
- **Email Validation**: Robust email format validation
- **Error Handling**: Secure error messages (no sensitive data leakage)
- **Environment Validation**: Required environment variables validation
- **JWT Authentication**: Secure token-based authentication

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

All errors are logged and return standardized JSON responses.

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### Email Templates

The system includes professional HTML email templates for:
- Certificate approval notifications
- Certificate rejection notifications
- Test emails

## 🔍 Monitoring & Debugging

### Health Check
```bash
curl http://localhost:3001/health
```

### Environment Check
```bash
npm run env:check
```

### Log Monitoring
```bash
npm run logs
```

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure email credentials
5. Set appropriate `LOG_LEVEL`
6. Enable HTTPS
7. Configure reverse proxy (nginx/Apache)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=WARN
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
JWT_SECRET=your_secure_jwt_secret
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the logs: `npm run logs`
- Test email functionality: `npm run test:email`
- Verify environment: `npm run env:check`
- Check server health: `npm run health`