import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiCalendar, FiClock, FiMessageCircle, FiShield, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ user, handleLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0', textAlign: 'center' }}>
        <img src="/logo.png" alt="Interskills Logo" style={{ height: '60px', width: 'auto' }} onError={(e) => e.target.style.display = 'none'} />
        <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}>Interskill Solutions<br/><span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-muted)' }}>Attendance Portal</span></span>
      </div>

      <div className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiClock /> Today's Attendance
        </NavLink>
        <NavLink to="/add-student" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiUserPlus /> Add Student
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiCalendar /> Attendance History
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiUsers /> All Students
        </NavLink>
        {user?.role === 'Admin' && (
          <NavLink to="/manage-teachers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiShield /> Manage Teachers
          </NavLink>
        )}
        <NavLink to="/contact-admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiMessageCircle /> Contact Admin
        </NavLink>
      </div>

      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name}</div>
          <div style={{ fontSize: '12px', color: user?.role === 'Admin' ? 'var(--warning)' : 'var(--success)' }}>
            {user?.role} Account
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn btn-outline" 
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
