import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { FiArrowLeft } from 'react-icons/fi';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found.</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
        <button className="btn btn-outline" onClick={() => navigate('/students')} style={{ padding: '8px' }}>
          <FiArrowLeft /> Back
        </button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Student Profile</h1>
      </div>

      <div className="glass-panel mb-4" style={{ display: 'flex', gap: '32px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Name</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{student.name}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Course</div>
          <div style={{ fontSize: '18px' }}>{student.course}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date of Joining</div>
          <div style={{ fontSize: '18px' }}>{format(new Date(student.dateOfJoining), 'MMM do, yyyy')}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600 }}>Attendance History</h2>
      
      <div className="glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No attendance records found.</td></tr>
            ) : history.map(record => {
              // Parse 'YYYY-MM-DD' properly considering local timezone 
              // A simple trick: append T00:00:00 to treat it as local or just parse
              const dateObj = parseISO(`${record.date}T12:00:00Z`); // use midday UTC to avoid timezone shift
              return (
                <tr key={record._id}>
                  <td style={{ fontWeight: 500 }}>{format(dateObj, 'EEEE, MMM do, yyyy')}</td>
                  <td>
                    <span className={`status-badge status-${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{record.reason || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentProfile;
