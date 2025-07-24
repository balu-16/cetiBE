import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Get certificate request status
router.get('/request-status/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        student_id,
        name,
        eligible
      `)
      .eq('phone_number', phoneNumber)
      .eq('deleted', false)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch certificate request status',
        details: error.message
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const hasCertificate = false;

    res.status(200).json({
      success: true,
      data: {
        studentId: student.student_id,
        name: student.name,
        hasSubmittedRequest: false,
        isEligible: student.eligible,
        hasCertificate,
        certificateGeneratedAt: null,
        status: hasCertificate ? 'completed' : 'not_requested'
      }
    });

  } catch (error) {
    console.error('📋 Certificate request status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate request status',
      message: error.message
    });
  }
});

// Certificate generation endpoint
router.post('/generate/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`🎓 Certificate generation request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Check if student exists and is eligible
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .eq('deleted', false)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    if (!student.eligible) {
      return res.status(400).json({
        success: false,
        error: 'Student is not eligible for certificate generation'
      });
    }

    // TODO: Implement actual certificate generation logic
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      message: 'Certificate generation initiated',
      studentId: studentId,
      status: 'processing'
    });
    
  } catch (error) {
    console.error('❌ Certificate generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate',
      details: error.message
    });
  }
});

// Certificate download endpoint
router.get('/download/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📥 Certificate download request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .eq('deleted', false)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // TODO: Implement actual certificate download logic
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      message: 'Certificate download would be initiated here',
      studentId: studentId,
      downloadUrl: `placeholder-download-url-for-${studentId}`
    });
    
  } catch (error) {
    console.error('❌ Certificate download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download certificate',
      details: error.message
    });
  }
});

// Certificate status endpoint
router.get('/status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📋 Certificate status request for student ID: ${studentId}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .eq('deleted', false)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // TODO: Check actual certificate status from database
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      data: {
        studentId: studentId,
        studentName: student.name,
        eligible: student.eligible,
        certificateStatus: student.eligible ? 'ready_for_generation' : 'not_eligible',
        generatedAt: null,
        downloadUrl: null
      }
    });
    
  } catch (error) {
    console.error('❌ Certificate status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate status',
      details: error.message
    });
  }
});

export default router;