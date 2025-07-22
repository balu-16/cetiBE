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

export default router;