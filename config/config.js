import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Email Configuration
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    service: 'gmail',
    from: {
      name: 'GPS Certificate System',
      address: process.env.EMAIL_USER
    }
  },

  // SMS Configuration (if needed)
  sms: {
    // Add SMS configuration here if needed
  },

  // Certificate Configuration
  certificate: {
    maxDownloads: 5,
    validityPeriod: '1 year'
  }
};

// Validate email configuration
if (config.email.user && !config.email.user.includes('@')) {
  console.error('❌ Invalid email configuration: EMAIL_USER must be a valid email address');
  process.exit(1);
}

console.log('✅ Configuration loaded successfully');
console.log(`🌍 Environment: ${config.server.environment}`);
console.log(`🚀 Server will run on port: ${config.server.port}`);