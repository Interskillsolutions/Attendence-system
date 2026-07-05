const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');

router.use(auth);

// Get all students
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Admin') {
      if (req.query.teacherId) {
        query.teacher = req.query.teacherId;
      }
    } else {
      query.teacher = req.user.id;
    }
    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new student
router.post('/', async (req, res) => {
  const student = new Student({
    name: req.body.name,
    course: req.body.course,
    dateOfJoining: req.body.dateOfJoining,
    teacher: req.user.id // Assign to the logged-in teacher
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Check ownership
    if (req.user.role !== 'Admin' && (!student.teacher || student.teacher.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role !== 'Admin' && (!student.teacher || student.teacher.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role !== 'Admin' && (!student.teacher || student.teacher.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
