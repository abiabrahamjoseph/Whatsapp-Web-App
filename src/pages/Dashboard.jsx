import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Dashboard.css';

export default function Dashboard({ showToast, currentUser }) {
  const [contacts] = useLocalStorage('wa_contacts', []);
  const [campaigns] = useLocalStorage('wa_campaigns', []);
  const [conversations] = useLocalStorage('wa_conversations', []);

  const totalContacts = contacts.length;
  
  const messagesSent = campaigns.reduce((acc, curr) => {
    const sentNum = parseInt(String(curr.sent).replace(/,/g, ''), 10) || 0;
    return acc + sentNum;
  }, 0);

  const activeAutomations = campaigns.filter(c => c.status === 'Active' && c.type !== 'Marketing').length;
  
  const readRates = campaigns.map(c => parseInt(String(c.readRate).replace('%',''), 10) || 0);
  const avgReadRate = readRates.length > 0 ? Math.round(readRates.reduce((a, b) => a + b, 0) / readRates.length) : 0;
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your completely fresh workspace, {currentUser?.name}! Let's get started.</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => showToast('Viewing Contacts Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Total Contacts</div>
          <div className="metric-value">{totalContacts}</div>
          <div className={`metric-trend ${totalContacts > 0 ? 'positive' : 'neutral'}`}>{totalContacts > 0 ? 'Active Database' : 'No data yet'}</div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Messages Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Messages Sent</div>
          <div className="metric-value">{messagesSent}</div>
          <div className={`metric-trend ${messagesSent > 0 ? 'positive' : 'neutral'}`}>{messagesSent > 0 ? 'Total' : 'No data yet'}</div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Engagement Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Avg Read Rate</div>
          <div className="metric-value">{avgReadRate}%</div>
          <div className={`metric-trend ${avgReadRate > 0 ? 'positive' : 'neutral'}`}>{avgReadRate > 0 ? 'Healthy' : 'No data yet'}</div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Automations Report...', 'info')} style={{cursor: 'pointer'}}>
          <div className="metric-title">Active Automations</div>
          <div className="metric-value">{activeAutomations}</div>
          <div className={`metric-trend ${activeAutomations > 0 ? 'positive' : 'neutral'}`}>{activeAutomations > 0 ? 'Running globally' : 'No data yet'}</div>
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
             {conversations.length === 0 ? (
               <p style={{color: 'var(--text-muted)', textAlign: 'center', padding: '48px 24px'}}>No recent conversations yet. Wait for inbound messages or launch your first broadcast.</p>
             ) : (
               <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'}}>
                 {conversations.slice(0, 4).map(chat => (
                   <div key={chat.id} style={{display: 'flex', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                     <div className="avatar" style={{marginRight: '12px', width: '40px', height: '40px'}}>{chat.initials}</div>
                     <div style={{flex: 1}}>
                       <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <strong style={{color: 'var(--text-main)'}}>{chat.name}</strong>
                         <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{chat.time}</span>
                       </div>
                       <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px'}}>
                         {chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'New conversation started'}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>
      </div>
    </div>
  );
}
