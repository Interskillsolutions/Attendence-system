import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiShield, FiTrash2, FiUser } from 'react-icons/fi';
import Modal from './Modal';

const ManageTeachers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch teachers. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'Teacher' ? 'Admin' : 'Teacher';
    try {
      const res = await axios.put(`/api/users/${user._id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === user._id ? res.data : u));
    } catch (err) {
      alert('Error updating role: ' + (err.response?.data?.message || ''));
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${selectedUser._id}`);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setDeleteModalOpen(false);
    } catch (err) {
      alert('Error deleting user: ' + (err.response?.data?.message || ''));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Manage Teachers</h1>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div className="glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user._id}>
                <td style={{ fontWeight: 500 }}><div className="flex items-center gap-2"><FiUser className="text-text-muted"/> {user.name}</div></td>
                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                <td>
                  <span className="status-badge" style={{ 
                    background: user.role === 'Admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: user.role === 'Admin' ? 'var(--warning)' : 'var(--success)',
                    border: `1px solid ${user.role === 'Admin' ? 'rgba(212, 175, 55, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`
                  }}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px' }} 
                      onClick={() => handleRoleToggle(user)}
                      title={user.role === 'Teacher' ? 'Promote to Admin' : 'Demote to Teacher'}
                    >
                      <FiShield /> {user.role === 'Teacher' ? 'Make Admin' : 'Make Teacher'}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px' }} 
                      onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); }}
                      title="Delete Account"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Teacher Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--danger)' }}>Are you sure you want to completely delete the account for <strong>{selectedUser?.name}</strong>? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Confirm Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageTeachers;
