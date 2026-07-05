import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddStudent from './components/AddStudent';
import History from './components/History';
import Students from './components/Students';
import StudentProfile from './components/StudentProfile';
import ContactAdmin from './components/ContactAdmin';
import Login from './components/Login';
import Register from './components/Register';
import ManageTeachers from './components/ManageTeachers';
import TeacherDashboard from './components/TeacherDashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/verify');
          if (res.data.valid) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: 'white' }}>Loading...</div>;
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="app-container">
          <Sidebar user={user} handleLogout={handleLogout} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/add-student" element={<AddStudent />} />
              <Route path="/history" element={<History currentRole={user.role} />} />
              <Route path="/students" element={<Students user={user} />} />
              <Route path="/student/:id" element={<StudentProfile currentRole={user.role} />} />
              <Route path="/contact-admin" element={<ContactAdmin />} />
              {user.role === 'Admin' && (
                <>
                  <Route path="/manage-teachers" element={<ManageTeachers />} />
                  <Route path="/teacher/:teacherId/dashboard" element={<TeacherDashboard />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
