const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

// Middleware to check if user is Admin
const isAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all users (Admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user role (Admin only)
router.put('/:id/role', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Teacher', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
