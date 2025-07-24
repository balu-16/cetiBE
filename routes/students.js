import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Students fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch students',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      data: students,
      count: students.length
    });

  } catch (error) {
    console.error('❌ Students fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      details: error.message
    });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', id)
      .eq('deleted', false)
      .single();

    if (error) {
      console.error('❌ Student fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch student',
        details: error.message
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('❌ Student fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student',
      details: error.message
    });
  }
});

// Update student eligibility status
router.put('/:studentId/eligibility', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { eligible } = req.body;
    
    console.log(`🎯 Eligibility update request for student ID: ${studentId}, eligible: ${eligible}`);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    if (typeof eligible !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Eligible status must be a boolean value'
      });
    }

    const { data, error } = await supabase
      .from('students')
      .update({ eligible })
      .eq('student_id', studentId)
      .eq('deleted', false)
      .select()
      .single();

    if (error) {
      console.error('❌ Eligibility update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update student eligibility',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    console.log(`✅ Student eligibility updated successfully for ID: ${studentId}`);
    
    res.status(200).json({
      success: true,
      data: data,
      message: `Student eligibility updated to ${eligible ? 'eligible' : 'not eligible'}`
    });
    
  } catch (error) {
    console.error('❌ Eligibility update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student eligibility',
      details: error.message
    });
  }
});

export default router;