import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login({ onLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      return showToast('Please enter both email and password', 'warning');
    }
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);

      let storedUsers = [];
      try {
        storedUsers = JSON.parse(localStorage.getItem('wa_users')) || [];
      } catch { /* ignore error if parsing fails */ }

      if (storedUsers.length === 0) {
        if (password !== 'Wa2026$$') {
          setPassword('');
          return showToast('Invalid credentials. Please try again.', 'error');
        }
        showToast('Login successful (Fallback Mode)', 'success');
        const nameParts = email.split('@')[0].split(/[._-]/);
        const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Admin';
        const initials = nameParts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2) || 'A';
        return onLogin({ name, email, initials, role: 'Admin' });
      }

      const matchedUser = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!matchedUser) {
        setPassword('');
        return showToast('Invalid credentials. Please try again.', 'error');
      }

      showToast('Login successful!', 'success');
      onLogin(matchedUser);
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
           <div className="login-branding">
             <div className="app-title">
               <span className="wa-icon">WA</span> Messenger
             </div>
             <div className="app-subtitle">
               <span className="sv-blue" style={{fontSize: '1.8rem'}}>Skill</span><span className="sv-red" style={{fontSize: '1.8rem'}}>versity</span>
             </div>
             <div className="app-tagline">JOB CAMPUS FROM IMS</div>
           </div>
           <p>Sign in to your WA Messenger account</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
               type="email" 
               placeholder="username@mail.com" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                 type={showPassword ? "text" : "password"} 
                 placeholder="Enter your password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 style={{ width: '100%', paddingRight: '48px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="login-actions">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password" onClick={(e) => { 
                e.preventDefault(); 
                try {
                  const storedUsers = JSON.parse(localStorage.getItem('wa_users')) || [];
                  const adminIndex = storedUsers.findIndex(u => u.role === 'Admin');
                  if (adminIndex !== -1) {
                    storedUsers[adminIndex].password = 'Wa2026$$';
                    localStorage.setItem('wa_users', JSON.stringify(storedUsers));
                    showToast('Admin password reset to: Wa2026$$', 'success');
                  } else {
                    showToast('No Admin account found to reset.', 'warning');
                  }
                } catch {
                  showToast('Error accessing database.', 'error');
                }
            }}>Forgot Password?</a>
          </div>
          <button type="submit" className="primary-btn full-width login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
