import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FiCheck, FiX, FiUmbrella } from 'react-icons/fi';
import Modal from './Modal';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState(''); // Present, Absent, Holiday
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(), 'EEEE, MMMM do, yyyy');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get(`/api/attendance/date/${todayStr}`)
      ]);
      setStudents(studentsRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStudentAttendance = (studentId) => {
    return attendance.find(a => a.student._id === studentId || a.student === studentId);
  };

  const handleActionClick = (student, type) => {
    setSelectedStudent(student);
    setActionType(type);
    setReason('');
    setError('');
    
    // For Present, we can just mark directly or open modal if we want optional reason
    // Let's open modal for all to keep it consistent, or directly mark if Present and no reason needed?
    // User said: "absent present there reason optional ask... hoilday reason compalsary"
    setModalOpen(true);
  };

  const submitAttendance = async () => {
    if (actionType === 'Holiday' && !reason.trim()) {
      setError('Reason is compulsory for Holiday');
      return;
    }

    try {
      const payload = {
        date: todayStr,
        studentId: selectedStudent._id,
        status: actionType,
        reason: reason.trim()
      };
      
      const res = await axios.post('/api/attendance/mark', payload);
      setModalOpen(false);
      
      // Update local state
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.student._id === selectedStudent._id || a.student === selectedStudent._id);
        if (existingIndex >= 0) {
          const newAtt = [...prev];
          newAtt[existingIndex] = res.data;
          // Important to keep populated student object if needed
          return newAtt;
        } else {
          return [...prev, { ...res.data, student: selectedStudent }];
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving attendance');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-title">
        <span>Today's Attendance</span>
        <span style={{ fontSize: '18px', color: 'var(--primary)', backgroundColor: 'var(--glass-bg)', padding: '8px 16px', borderRadius: '20px' }}>
          {displayDate}
        </span>
      </div>

      <div className="glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No students found. Add one first.</td></tr>
            ) : students.map(student => {
              const record = getStudentAttendance(student._id);
              return (
                <tr key={student._id}>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{student.course}</td>
                  <td>
                    {record ? (
                      <span className={`status-badge status-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    ) : (
                      <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>Unmarked</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{record?.reason || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-success" style={{ padding: '6px 12px' }} onClick={() => handleActionClick(student, 'Present')} title="Mark Present">
                        <FiCheck />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleActionClick(student, 'Absent')} title="Mark Absent">
                        <FiX />
                      </button>
                      <button className="btn btn-warning" style={{ padding: '6px 12px' }} onClick={() => handleActionClick(student, 'Holiday')} title="Mark Holiday">
                        <FiUmbrella />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Mark ${actionType} - ${selectedStudent?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Reason {actionType === 'Holiday' ? '(Compulsory)' : '(Optional)'}
            </label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder={`Enter reason for ${actionType.toLowerCase()}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>
          
          <button 
            className={`btn ${actionType === 'Present' ? 'btn-success' : actionType === 'Absent' ? 'btn-danger' : 'btn-warning'}`}
            style={{ width: '100%', marginTop: '8px' }}
            onClick={submitAttendance}
          >
            Confirm {actionType}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
