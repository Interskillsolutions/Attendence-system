import React, { useState } from 'react';
import axios from 'axios';
import { FiSave } from 'react-icons/fi';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    dateOfJoining: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    try {
      await axios.post('/api/students', formData);
      setStatus({ type: 'success', message: 'Student added successfully!' });
      setFormData({ name: '', course: '', dateOfJoining: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Error adding student' });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Add New Student</h1>
      
      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        {status.message && (
          <div className={`mb-4 p-3 rounded ${status.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`} style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? '#34D399' : '#F87171' }}>
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="block mb-2 text-text-muted" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="glass-input" 
              placeholder="e.g. John Doe"
              required 
            />
          </div>
          <div>
            <label className="block mb-2 text-text-muted" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Course Enrolled</label>
            <input 
              type="text" 
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="glass-input" 
              placeholder="e.g. Full Stack Development"
              required 
            />
          </div>
          <div>
            <label className="block mb-2 text-text-muted" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date of Joining</label>
            <input 
              type="date" 
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              className="glass-input" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4" style={{ alignSelf: 'flex-start' }}>
            <FiSave /> Save Student
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
