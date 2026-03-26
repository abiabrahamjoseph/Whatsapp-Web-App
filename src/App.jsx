import React, { useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Campaigns from './pages/Campaigns';
import Users from './pages/Users';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'Dashboard': return <Dashboard showToast={showToast} currentUser={currentUser} />;
      case 'Inbox': return <Inbox showToast={showToast} />;
      case 'Broadcasts': return <Campaigns showToast={showToast} />;
      case 'Users & Roles': return <Users showToast={showToast} currentUser={currentUser} />;
      case 'Automations': return <Automations showToast={showToast} />;
      case 'Contacts': return <Contacts showToast={showToast} setCurrentPage={setCurrentPage} />;
      case 'Settings': return <Settings showToast={showToast} initialTab="Integration" currentUser={currentUser} />;
      case 'My Profile Settings': return <Settings showToast={showToast} initialTab="Profile" currentUser={currentUser} />;
      case 'Security': return <Settings showToast={showToast} initialTab="Security" currentUser={currentUser} />;
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
