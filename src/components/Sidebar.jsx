import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ currentPage = 'Dashboard', setCurrentPage, showToast, currentUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navItems = ['Dashboard', 'Inbox', 'Broadcasts', 'Automations', 'Contacts', 'Users & Roles', 'Settings'];

  return (
    <aside className="sidebar">
      <div className="sidebar-branding">
        <div className="app-title">
          <span className="wa-icon">WA</span> Messenger
        </div>
        <div className="app-subtitle" style={{marginTop: '4px'}}>
          <span className="sv-blue" style={{fontSize: '1.4rem'}}>Skill</span><span className="sv-red" style={{fontSize: '1.4rem'}}>versity</span>
        </div>
        <div className="app-tagline">JOB CAMPUS FROM IMS</div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map(item => (
            <li key={item} className={currentPage === item ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage?.(item); }}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile-wrapper" style={{position: 'relative'}}>
          <div className="user-profile" style={{cursor: 'pointer'}} onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="avatar">{currentUser?.initials || 'A'}</div>
            <div className="user-info">
              <span className="name">{currentUser?.name || 'Admin'}</span>
              <span className="role">{currentUser?.role || 'Admin'}</span>
            </div>
            <span style={{marginLeft: 'auto', color: 'var(--text-muted)'}}>⋮</span>
          </div>
          
          {isProfileOpen && (
            <div className="profile-dropdown">
               <div className="dropdown-header">
                 <strong>{currentUser?.email || 'admin@skillversity.com'}</strong>
               </div>
               <ul>
                 <li onClick={() => { setIsProfileOpen(false); setCurrentPage('My Profile Settings'); }}>My Profile Settings</li>
                 <li onClick={() => { setIsProfileOpen(false); setCurrentPage('Security'); }}>Security</li>
                 <li className="danger-text" onClick={() => { setIsProfileOpen(false); showToast('Logged out securely.', 'success'); setTimeout(() => window.location.reload(), 1000); }}>Log out</li>
               </ul>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
