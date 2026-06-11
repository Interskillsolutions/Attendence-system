import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const History = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceForDate(selectedDate);
  }, [selectedDate]);

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

  // Get leading empty days for grid (0 = Sunday, 1 = Monday etc)
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

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
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={day.toString()} 
                  className={`calendar-day ${isSelected ? 'active' : ''}`}
                  style={{ border: isToday && !isSelected ? '1px solid var(--primary)' : '' }}
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
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600 }}>
            Records for {format(selectedDate, 'EEEE, MMMM do, yyyy')}
          </h2>
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No records found for this date.</td></tr>
                ) : attendance.map(record => (
                  <tr key={record._id}>
                    <td style={{ fontWeight: 500 }}>{record.student?.name || 'Unknown Student'}</td>
                    <td>
                      <span className={`status-badge status-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{record.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
