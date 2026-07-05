import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { FiArrowLeft, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Modal from './Modal';

const StudentProfile = ({ currentRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal State for Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, historyRes] = await Promise.all([
        axios.get(`/api/students/${id}`),
        axios.get(`/api/attendance/student/${id}`)
      ]);
      setStudent(studentRes.data);
      if (studentRes.data.dateOfJoining) {
        setEditDate(studentRes.data.dateOfJoining.split('T')[0]);
      }
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    try {
      const res = await axios.put(`/api/students/${id}`, { dateOfJoining: editDate });
      setStudent(res.data);
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update student');
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found.</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
        <button className="btn btn-outline" onClick={() => navigate('/students')} style={{ padding: '8px' }}>
          <FiArrowLeft /> Back
        </button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Student Profile</h1>
        
        {currentRole === 'Admin' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={() => setEditModalOpen(true)}>
              <FiEdit2 /> Edit Info
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel mb-4" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Name</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{student.name}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Course (Batch)</div>
          <div style={{ fontSize: '18px' }}>{student.course}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date of Joining</div>
          <div style={{ fontSize: '18px' }}>
            {student.dateOfJoining && !isNaN(new Date(student.dateOfJoining)) 
              ? format(new Date(student.dateOfJoining), 'MMM do, yyyy') 
              : 'Unknown Date'}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600 }}>Personal Attendance Calendar</h2>
      
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '24px' }}>
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
            const record = history.find(r => r.date === dateStr);
            
            let bgColor = 'rgba(255, 255, 255, 0.05)';
            let borderColor = '';
            
            if (record) {
              if (record.status === 'Present') bgColor = 'rgba(16, 185, 129, 0.2)'; // Green
              else if (record.status === 'Absent') bgColor = 'rgba(239, 68, 68, 0.2)'; // Red
              else if (record.status === 'Holiday') bgColor = 'rgba(156, 163, 175, 0.2)'; // Grey
              else if (record.status === 'Not Scheduled') bgColor = 'rgba(156, 163, 175, 0.2)'; // Grey
            }

            const isToday = isSameDay(day, new Date());
            if (isToday) {
              borderColor = 'var(--primary)';
            }

            return (
              <div 
                key={day.toString()} 
                className="calendar-day"
                style={{ 
                  backgroundColor: bgColor,
                  border: borderColor ? `1px solid ${borderColor}` : '',
                  position: 'relative'
                }}
                title={record ? `${record.status}${record.reason ? `: ${record.reason}` : ''}` : 'Unmarked'}
              >
                {format(day, 'd')}
                {record && (
                  <div style={{ position: 'absolute', bottom: '4px', fontSize: '10px', color: 'var(--text-main)', opacity: 0.8 }}>
                    {record.status.substring(0,1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals for Admin Actions */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Info">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date of Joining</label>
            <input 
              type="date" 
              className="glass-input" 
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={handleEditSave}>
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfile;
