import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiCalendar, FiClock } from 'react-icons/fi';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        Interskill<span>Solutions</span>
      </div>
      <div className="nav-links">
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
      </div>
    </div>
  );
};

export default Sidebar;
