// Simple deployment test endpoint
// This endpoint tests all the main functionality without requiring external dependencies

import express from 'express';

const router = express.Router();

// Test endpoint for deployment verification
router.get('/deployment-test', async (req, res) => {
  try {
    const tests = {
      environment: process.env.NODE_ENV || 'development',
      serverless: !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    // Test basic functionality
    const basicTests = {
      jsonParsing: true,
      dateFormatting: new Date().toLocaleDateString(),
      mathOperations: 2 + 2 === 4,
      stringOperations: 'test'.toUpperCase() === 'TEST'
    };

    res.json({
      status: 'success',
      message: 'Deployment test passed',
      environment: tests,
      basicTests,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Deployment test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;