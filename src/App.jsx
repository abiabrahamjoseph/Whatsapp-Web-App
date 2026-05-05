import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Campaigns from './pages/Campaigns';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Automations from './pages/Automations';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <h2>{title}</h2>
        <p>This module is not yet implemented.</p>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage('wa_currentUser', null);
  const [roles] = useLocalStorage('wa_roles', []);
  const [currentPage, setCurrentPage] = useLocalStorage('wa_currentPage', 'Dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderPage = () => {
    const currentRoleObj = roles.find(r => r.name === currentUser?.role);
    const hasPermission = (page) => {
      // Profile, Security, and Dashboard are always allowed
      if (page === 'My Profile Settings' || page === 'Security' || page === 'Dashboard') return true;
      if (currentRoleObj && currentRoleObj.permissions) {
        if (currentRoleObj.permissions.includes('Users & Roles') && (page === 'Users' || page === 'Roles' || page === 'Users & Roles')) return true;
        return currentRoleObj.permissions.includes(page);
      }
      return true; // Fallback for old configurations
    };

    if (!hasPermission(currentPage)) {
      return (
        <div className="placeholder-page" style={{textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <h2 style={{color: 'var(--danger)', marginBottom: '12px'}}>Access Denied</h2>
          <p style={{color: 'var(--text-muted)'}}>You do not have permission to view the <strong>{currentPage}</strong> module.</p>
          <button className="primary-btn" onClick={() => setCurrentPage('Dashboard')} style={{marginTop: '24px'}}>Return to Dashboard</button>
        </div>
      );
    }

    switch(currentPage) {
      case 'Dashboard': return <Dashboard showToast={showToast} currentUser={currentUser} />;
      case 'Inbox': return <Inbox showToast={showToast} setCurrentPage={setCurrentPage} />;
      case 'Broadcasts': return <Campaigns showToast={showToast} />;
      case 'Users': return <Users showToast={showToast} currentUser={currentUser} />;
      case 'Roles': return <Roles showToast={showToast} />;
      case 'Users & Roles': setTimeout(() => setCurrentPage('Users'), 0); return <Users showToast={showToast} currentUser={currentUser} />;
      case 'Automations': return <Automations showToast={showToast} />;
      case 'Contacts': return <Contacts showToast={showToast} setCurrentPage={setCurrentPage} />;
      case 'Settings': return <Settings showToast={showToast} initialTab="Integration" currentUser={currentUser} setCurrentUser={setCurrentUser} />;
      case 'My Profile Settings': return <Settings showToast={showToast} initialTab="Profile" currentUser={currentUser} setCurrentUser={setCurrentUser} />;
      case 'Security': return <Settings showToast={showToast} initialTab="Security" currentUser={currentUser} setCurrentUser={setCurrentUser} />;
      default: return <PlaceholderPage title={currentPage} />;
    }
  };

  return (
    <>
      {toast && (
        <div className={`global-toast toast-${toast.type}`} style={{zIndex: 99999}}>
          {toast.message}
        </div>
      )}
      {!currentUser ? (
        <Login onLogin={(user) => setCurrentUser(user)} showToast={showToast} />
      ) : (
        <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage} showToast={showToast} currentUser={currentUser}>
          {renderPage()}
        </DashboardLayout>
      )}
    </>
  );
}

export default App;
