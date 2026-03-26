import React from 'react';
import './Dashboard.css';

export default function Dashboard({ showToast, currentUser }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your completely fresh workspace, {currentUser?.name}! Let's get started.</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => showToast('Viewing Contacts Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Total Contacts</div>
          <div className="metric-value">0</div>
          <div className="metric-trend neutral">No data yet</div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Messages Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Messages Sent</div>
          <div className="metric-value">0</div>
          <div className="metric-trend neutral">No data yet</div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Engagement Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Read Rate</div>
          <div className="metric-value">0%</div>
          <div className="metric-trend neutral">No data yet</div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Automations Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Active Automations</div>
          <div className="metric-value">0</div>
          <div className="metric-trend neutral">No data yet</div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="chart-section" onClick={() => showToast('Chart interaction clicked', 'info')} style={{cursor: 'pointer'}}>
          <h2>Message Activity</h2>
          <div className="placeholder-chart">
            <div className="bar" style={{height: '2%'}}></div>
            <div className="bar" style={{height: '2%'}}></div>
            <div className="bar" style={{height: '2%'}}></div>
            <div className="bar" style={{height: '2%'}}></div>
            <div className="bar" style={{height: '2%'}}></div>
            <div className="bar" style={{height: '2%'}}></div>
            <div className="bar" style={{height: '2%'}}></div>
          </div>
        </section>
        
        <section className="recent-activity">
          <h2>Recent Conversations</h2>
          <div className="activity-list">
             <p style={{color: 'var(--text-muted)', textAlign: 'center', padding: '48px 24px'}}>No recent conversations yet. Wait for inbound messages or launch your first broadcast.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
