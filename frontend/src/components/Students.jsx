import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">All Students</h1>
      
      <div className="glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Date of Joining</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No students found.</td></tr>
            ) : students.map(student => (
              <tr key={student._id}>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{student.course}</td>
                <td style={{ color: 'var(--text-muted)' }}>{format(new Date(student.dateOfJoining), 'MMM do, yyyy')}</td>
                <td>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                    onClick={() => navigate(`/student/${student._id}`)}
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
