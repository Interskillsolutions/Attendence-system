const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

router.use(auth);

// Helper to get allowed student IDs for the current user
const getAllowedStudentIds = async (user, requestedTeacherId = null) => {
  if (user.role === 'Admin') {
    if (requestedTeacherId) {
      const students = await Student.find({ teacher: requestedTeacherId }).select('_id');
      return students.map(s => s._id);
    }
    return null; // null means allow all
  }
  const students = await Student.find({ teacher: user.id }).select('_id');
  return students.map(s => s._id);
};

// Mark attendance
router.post('/mark', async (req, res) => {
  try {
    const { date, studentId, status, reason } = req.body;
    
    // Ownership check
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (req.user.role !== 'Admin' && (!student.teacher || student.teacher.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if record exists for this date and student
    let record = await Attendance.findOne({ date, student: studentId });
    
    if (record) {
      record.status = status;
      record.reason = reason;
      await record.save();
    } else {
      record = new Attendance({ date, student: studentId, status, reason });
      await record.save();
    }
    
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Clear/Reset attendance to UNMARKED
router.delete('/clear/:date/:studentId', async (req, res) => {
  try {
    const { date, studentId } = req.params;
    
    // Ownership check
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (req.user.role !== 'Admin' && (!student.teacher || student.teacher.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Attendance.findOneAndDelete({ date, student: studentId });
    res.json({ message: 'Attendance reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    let query = { date: req.params.date };
    const allowedIds = await getAllowedStudentIds(req.user, req.query.teacherId);
    if (allowedIds !== null) {
      query.student = { $in: allowedIds };
    }

    const records = await Attendance.find(query).populate('student');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance history for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (req.user.role !== 'Admin' && (!student.teacher || student.teacher.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance summary for a month (e.g. 2026-06)
router.get('/month/:yearMonth', async (req, res) => {
  try {
    let query = { date: { $regex: `^${req.params.yearMonth}` } };
    const allowedIds = await getAllowedStudentIds(req.user, req.query.teacherId);
    if (allowedIds !== null) {
      query.student = { $in: allowedIds };
    }

    const records = await Attendance.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
