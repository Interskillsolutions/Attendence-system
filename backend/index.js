const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://interskillsolutions:interskillsolutions@cluster0.wuzmtku.mongodb.net/attendance?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Attendance Management System API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
