import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FiCheck, FiX, FiUmbrella, FiMinusCircle, FiArrowLeft, FiRotateCcw } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from './Modal';

const TeacherDashboard = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState(''); // Present, Absent, Holiday, Not Scheduled
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(), 'EEEE, MMMM do, yyyy');

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      const [studentsRes, attendanceRes, usersRes] = await Promise.all([
        axios.get(`/api/students?teacherId=${teacherId}`),
        axios.get(`/api/attendance/date/${todayStr}?teacherId=${teacherId}`),
        axios.get('/api/users')
      ]);
      setStudents(studentsRes.data);
      setAttendance(attendanceRes.data);
      const foundTeacher = usersRes.data.find(u => u._id === teacherId);
      if (foundTeacher) setTeacher(foundTeacher);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
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
    
    if (type === 'Present' || type === 'Not Scheduled' || type === 'Reset') {
      submitAttendanceDirect(student, type, '');
    } else {
      setModalOpen(true);
    }
  };

  const submitAttendanceDirect = async (studentObj, type, reasonText) => {
    try {
      if (type === 'Reset') {
        await axios.delete(`/api/attendance/clear/${todayStr}/${studentObj._id}`);
        setAttendance(prev => prev.filter(a => (a.student?._id || a.student) !== studentObj._id));
        return;
      }

      const payload = {
        date: todayStr,
        studentId: studentObj._id,
        status: type,
        reason: reasonText
      };
      
      const res = await axios.post('/api/attendance/mark', payload);
      
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.student._id === studentObj._id || a.student === studentObj._id);
        if (existingIndex >= 0) {
          const newAtt = [...prev];
          newAtt[existingIndex] = res.data;
          return newAtt;
        } else {
          return [...prev, { ...res.data, student: studentObj }];
        }
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving attendance');
    }
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
      
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.student._id === selectedStudent._id || a.student === selectedStudent._id);
        if (existingIndex >= 0) {
          const newAtt = [...prev];
          newAtt[existingIndex] = res.data;
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

  const groupedStudents = students.reduce((acc, student) => {
    const course = student.course || 'Unassigned Course';
    if (!acc[course]) acc[course] = [];
    acc[course].push(student);
    return acc;
  }, {});

  const courseNames = Object.keys(groupedStudents).sort((a, b) => {
    const aComplete = groupedStudents[a].every(student => getStudentAttendance(student._id));
    const bComplete = groupedStudents[b].every(student => getStudentAttendance(student._id));
    if (aComplete && !bComplete) return 1;
    if (!aComplete && bComplete) return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>
          <FiArrowLeft /> Back
        </button>
        <div className="page-title" style={{ marginBottom: 0 }}>
          <span>{teacher ? `${teacher.name}'s Classes` : "Teacher's Classes"}</span>
          <span style={{ fontSize: '18px', color: 'var(--primary)', backgroundColor: 'var(--glass-bg)', padding: '8px 16px', borderRadius: '20px', marginLeft: '16px' }}>
            {displayDate}
          </span>
        </div>
      </div>

      {Object.keys(groupedStudents).length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '24px' }}>No students found for this teacher.</div>
      ) : (
        courseNames.map(course => (
          <div key={course} className="glass-panel" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              {course}
            </h2>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedStudents[course].map(student => {
                  const record = getStudentAttendance(student._id);
                  return (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td>
                        {record ? (
                          <span className={`status-badge status-${record.status.toLowerCase().replace(' ', '-')}`}>
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
                          <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleActionClick(student, 'Not Scheduled')} title="Not Scheduled">
                            <FiMinusCircle />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '6px 12px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleActionClick(student, 'Reset')} title="Reset to Unmarked">
                            <FiRotateCcw />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}

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

export default TeacherDashboard;
