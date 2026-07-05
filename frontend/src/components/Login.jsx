import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '60px', marginBottom: '16px' }} onError={(e) => e.target.style.display = 'none'} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to Attendance Portal</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="glass-input" 
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="glass-input" 
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
