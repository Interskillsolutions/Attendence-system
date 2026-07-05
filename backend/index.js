const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://interskillsolutions:interskillsolutions@cluster0.wuzmtku.mongodb.net/attendance?retryWrites=true&w=majority&appName=Cluster0';

const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    // Seed Master Admin if not exists
    try {
      const adminExists = await User.findOne({ email: 'admin@interskills.in' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await User.create({
          name: 'Master Admin',
          email: 'admin@interskills.in',
          password: hashedPassword,
          role: 'Admin'
        });
        console.log('Master Admin account seeded successfully');
      }
    } catch (err) {
      console.error('Error seeding admin:', err);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Attendance Management System API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
