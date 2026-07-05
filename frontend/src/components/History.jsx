import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCheck, FiX, FiUmbrella, FiMinusCircle, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import Modal from './Modal';

const History = ({ currentRole }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State for Admin Override
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  
  // Modal State for Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [monthSummary, setMonthSummary] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendanceForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthSummary(currentMonth);
  }, [currentMonth]);

  const fetchMonthSummary = async (date) => {
    const yearMonth = format(date, 'yyyy-MM');
    try {
      const res = await axios.get(`/api/attendance/month/${yearMonth}`);
      setMonthSummary(res.data);
    } catch (err) {
      console.error('Error fetching month summary:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    setLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      const res = await axios.get(`/api/attendance/date/${dateStr}`);
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getStudentAttendance = (studentId) => {
    return attendance.find(a => a.student?._id === studentId || a.student === studentId);
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
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      if (type === 'Reset') {
        await axios.delete(`/api/attendance/clear/${dateStr}/${studentObj._id}`);
        setAttendance(prev => prev.filter(a => (a.student?._id || a.student) !== studentObj._id));
        fetchMonthSummary(currentMonth);
        return;
      }

      const payload = {
        date: dateStr,
        studentId: studentObj._id,
        status: type,
        reason: reasonText
      };
      
      const res = await axios.post('/api/attendance/mark', payload);
      
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.student?._id === studentObj._id || a.student === studentObj._id);
        if (existingIndex >= 0) {
          const newAtt = [...prev];
          newAtt[existingIndex] = res.data;
          return newAtt;
        } else {
          return [...prev, { ...res.data, student: studentObj }];
        }
      });
      // Optionally re-fetch month summary if we want colors to update immediately
      fetchMonthSummary(currentMonth);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving attendance override');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/students/${selectedStudent._id}`);
      setDeleteModalOpen(false);
      setStudents(students.filter(s => s._id !== selectedStudent._id));
      setAttendance(attendance.filter(a => (a.student?._id || a.student) !== selectedStudent._id));
      fetchMonthSummary(currentMonth);
    } catch (err) {
      console.error(err);
      alert('Failed to delete student: ' + (err.response?.data?.message || err.message));
    }
  };

  const submitAttendance = async () => {
    if (actionType === 'Holiday' && !reason.trim()) {
      setError('Reason is compulsory for Holiday');
      return;
    }

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const payload = {
        date: dateStr,
        studentId: selectedStudent._id,
        status: actionType,
        reason: reason.trim()
      };
      
      const res = await axios.post('/api/attendance/mark', payload);
      setModalOpen(false);
      
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.student?._id === selectedStudent._id || a.student === selectedStudent._id);
        if (existingIndex >= 0) {
          const newAtt = [...prev];
          newAtt[existingIndex] = res.data;
          return newAtt;
        } else {
          return [...prev, { ...res.data, student: selectedStudent }];
        }
      });
      fetchMonthSummary(currentMonth);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving attendance override');
    }
  };

  // If Teacher, only show existing attendance records. If Admin, show all students so they can be overridden.
  const displayList = currentRole === 'Admin' ? students : attendance.map(a => a.student).filter(Boolean);

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Attendance History</h1>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Calendar Picker */}
        <div className="glass-panel" style={{ width: '350px', flexShrink: 0 }}>
          <div className="flex justify-between items-center mb-4">
            <button className="btn btn-outline" style={{ padding: '8px' }} onClick={prevMonth}><FiChevronLeft /></button>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button className="btn btn-outline" style={{ padding: '8px' }} onClick={nextMonth}><FiChevronRight /></button>
          </div>
          
          <div className="calendar-grid" style={{ marginBottom: '8px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{day}</div>
            ))}
          </div>
          
          <div className="calendar-grid">
            {emptyDays.map(empty => (
              <div key={`empty-${empty}`} />
            ))}
            {daysInMonth.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayRecords = monthSummary.filter(r => r.date === dateStr);
              
              let bgColor = '';
              let borderColor = '';
              
              if (dayRecords.length > 0) {
                const hasClass = dayRecords.some(r => r.status === 'Present' || r.status === 'Absent');
                const hasHoliday = dayRecords.some(r => r.status === 'Holiday');
                
                if (hasClass) {
                  bgColor = 'rgba(16, 185, 129, 0.2)'; // Green
                  borderColor = 'rgba(16, 185, 129, 0.5)';
                } else if (hasHoliday) {
                  bgColor = 'rgba(239, 68, 68, 0.2)'; // Red
                  borderColor = 'rgba(239, 68, 68, 0.5)';
                }
              }

              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              if (isSelected) {
                bgColor = 'var(--primary)';
                borderColor = 'white';
              } else if (isToday && !isSelected && !borderColor) {
                borderColor = 'var(--primary)';
              }

              return (
                <div 
                  key={day.toString()} 
                  className={`calendar-day ${isSelected ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: bgColor || 'rgba(255, 255, 255, 0.05)',
                    border: borderColor ? `1px solid ${borderColor}` : '' 
                  }}
                  onClick={() => setSelectedDate(day)}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="glass-panel" style={{ flexGrow: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>
              Records for {format(selectedDate, 'EEEE, MMMM do')}
            </h2>
            {currentRole === 'Admin' && (
              <span className="status-badge" style={{ background: 'var(--warning)', color: 'white' }}>Admin Override Mode</span>
            )}
          </div>
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Reason</th>
                  {currentRole === 'Admin' && <th>Override Action</th>}
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr><td colSpan={currentRole === 'Admin' ? 4 : 3} style={{ textAlign: 'center', padding: '24px' }}>No records found for this date.</td></tr>
                ) : displayList.map(student => {
                  if (!student) return null;
                  const record = currentRole === 'Admin' ? getStudentAttendance(student._id) : attendance.find(a => a.student?._id === student._id);
                  
                  return (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
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
                      
                      {currentRole === 'Admin' && (
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
                            <button className="btn btn-danger" style={{ padding: '6px 12px', opacity: 0.8 }} onClick={() => { setSelectedStudent(student); setDeleteModalOpen(true); }} title="Delete Student Completely">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Override ${actionType} - ${selectedStudent?.name}`}>
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
            className={`btn ${actionType === 'Present' ? 'btn-success' : actionType === 'Absent' ? 'btn-danger' : actionType === 'Holiday' ? 'btn-warning' : 'btn-outline'}`}
            style={{ width: '100%', marginTop: '8px' }}
            onClick={submitAttendance}
          >
            Confirm Override
          </button>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Student">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--danger)' }}>Are you sure you want to completely delete <strong>{selectedStudent?.name}</strong>? This will remove all their records across the entire system and cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Confirm Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default History;
