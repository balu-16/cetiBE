import app from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Start the server for local development
const server = app.listen(PORT, () => {
  console.log(`🚀 Certificate Hub Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/v1/auth`);
  console.log(`📜 Students API: http://localhost:${PORT}/v1/students`);
  console.log(`📱 SMS API: http://localhost:${PORT}/v1/sms/send`);
  console.log(`🎓 Certificate APIs:`);
  console.log(`   Generate: POST http://localhost:${PORT}/v1/certificates/generate/:studentId`);
  console.log(`   Download: GET http://localhost:${PORT}/v1/certificates/download/:studentId`);
  console.log(`   Status: GET http://localhost:${PORT}/v1/certificates/status/:studentId`);
  console.log(`✅ Certificate Hub Backend ready!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Certificate Hub Backend Server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Certificate Hub Backend Server...');
  server.close(() => {
    process.exit(0);
  });
});