import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      return showToast('Please enter both email and password', 'warning');
    }
    
    if (password !== 'Wa2026$$') {
      setPassword('');
      return showToast('Invalid credentials. Please try again.', 'error');
    }
    
    setLoading(true);
    
    // Mock authentication API call
    setTimeout(() => {
      setLoading(false);
      showToast('Login successful!', 'success');
      
      // Extract dynamic username from the provided email
      const nameParts = email.split('@')[0].split(/[._-]/);
      const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Admin';
      const initials = nameParts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2) || 'A';
      
      onLogin({ name, email, initials, role: 'Admin' });
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
           <div className="login-branding" style={{marginBottom: '24px'}}>
             <div className="app-title" style={{justifyContent: 'center', fontSize: '1.75rem', marginBottom: '8px'}}>
               <span className="wa-icon">WA</span> Messenger
             </div>
             <div className="app-subtitle" style={{marginTop: '4px', textAlign: 'center'}}>
               <span className="sv-blue" style={{fontSize: '1.8rem'}}>Skill</span><span className="sv-red" style={{fontSize: '1.8rem'}}>versity</span>
             </div>
             <div className="app-tagline" style={{textAlign: 'center', marginTop: '-4px', marginLeft: '4px'}}>JOB CAMPUS FROM IMS</div>
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
            <input 
               type="password" 
               placeholder="Enter your password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="login-actions">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); showToast('Password reset contact IT.', 'info'); }}>Forgot Password?</a>
          </div>
          <button type="submit" className="primary-btn full-width login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
