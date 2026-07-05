import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FiTrash2 } from 'react-icons/fi';
import Modal from './Modal';

const Students = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/students/${selectedStudent._id}`);
      setStudents(students.filter(s => s._id !== selectedStudent._id));
      setDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to delete student');
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
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                      onClick={() => navigate(`/student/${student._id}`)}
                    >
                      View History
                    </button>
                    {user?.role === 'Admin' && (
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                        onClick={() => { setSelectedStudent(student); setDeleteModalOpen(true); }}
                        title="Delete Student"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Student">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--danger)' }}>Are you sure you want to completely delete {selectedStudent?.name}? This will remove all their records and cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Confirm Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
