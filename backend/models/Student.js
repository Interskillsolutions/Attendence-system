const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateOfJoining: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
