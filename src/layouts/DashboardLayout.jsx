import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout({ children, currentPage, setCurrentPage, showToast, currentUser }) {
  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} showToast={showToast} currentUser={currentUser} />
      <div className="main-content">
        <Header showToast={showToast} setCurrentPage={setCurrentPage} currentUser={currentUser} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
