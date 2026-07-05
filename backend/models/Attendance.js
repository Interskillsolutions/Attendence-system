const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Holiday', 'Not Scheduled'],
    required: true,
  },
  reason: {
    type: String,
    required: function() {
      // Reason is compulsory if Holiday
      return this.status === 'Holiday';
    }
  }
}, { timestamps: true });

// Ensure a student can only have one attendance record per date
attendanceSchema.index({ date: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
