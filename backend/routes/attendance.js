const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Mark or update attendance
router.post('/mark', async (req, res) => {
  const { date, studentId, status, reason } = req.body;

  try {
    // Validate holiday reason
    if (status === 'Holiday' && !reason) {
      return res.status(400).json({ message: 'Reason is compulsory for Holiday' });
    }

    // Check if record already exists
    let attendance = await Attendance.findOne({ date, student: studentId });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.reason = reason || '';
      await attendance.save();
    } else {
      // Create new record
      attendance = new Attendance({
        date,
        student: studentId,
        status,
        reason: reason || ''
      });
      await attendance.save();
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const records = await Attendance.find({ date: req.params.date }).populate('student');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance history for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
