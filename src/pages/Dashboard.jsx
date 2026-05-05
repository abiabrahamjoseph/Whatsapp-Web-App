import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, BarChart3, Zap } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ showToast, currentUser }) {
  const [contacts] = useLocalStorage('wa_contacts', []);
  const [campaigns] = useLocalStorage('wa_campaigns', []);
  const [conversations] = useLocalStorage('wa_conversations', []);

  const totalContacts = contacts.length;
  
  const totalInboxMessagesSent = conversations.reduce((acc, conv) => {
    return acc + (conv.messages ? conv.messages.filter(m => m.type === 'sent').length : 0);
  }, 0);

  const campaignMessagesSent = campaigns.reduce((acc, curr) => {
    const sentNum = parseInt(String(curr.sent).replace(/,/g, ''), 10) || 0;
    return acc + sentNum;
  }, 0);

  const messagesSent = totalInboxMessagesSent + campaignMessagesSent;

  const activeAutomations = campaigns.filter(c => c.status === 'Active' && c.type !== 'Marketing').length;
  
  const readRates = campaigns.map(c => parseInt(String(c.readRate).replace('%',''), 10) || 0);
  const avgReadRate = readRates.length > 0 ? Math.round(readRates.reduce((a, b) => a + b, 0) / readRates.length) : 0;

  const chartData = [
    { name: 'Mon', messages: Math.round(messagesSent * 0.1) },
    { name: 'Tue', messages: Math.round(messagesSent * 0.15) },
    { name: 'Wed', messages: Math.round(messagesSent * 0.25) },
    { name: 'Thu', messages: Math.round(messagesSent * 0.2) },
    { name: 'Fri', messages: Math.round(messagesSent * 0.15) },
    { name: 'Sat', messages: Math.round(messagesSent * 0.1) },
    { name: 'Sun', messages: Math.round(messagesSent * 0.05) },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your complete workspace, {currentUser?.name || 'Admin'}. Let's dive in.</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => showToast('Viewing Contacts Report...', 'info')}>
          <div className="metric-icon blue"><Users size={24} /></div>
          <div className="metric-content">
            <div className="metric-title">Total Contacts</div>
            <div className="metric-value">{totalContacts}</div>
            <div className={`metric-trend ${totalContacts > 0 ? 'positive' : 'neutral'}`}>{totalContacts > 0 ? '+12% this week' : 'No data yet'}</div>
          </div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Messages Report...', 'info')}>
          <div className="metric-icon green"><MessageSquare size={24} /></div>
          <div className="metric-content">
            <div className="metric-title">Messages Sent</div>
            <div className="metric-value">{messagesSent}</div>
            <div className={`metric-trend ${messagesSent > 0 ? 'positive' : 'neutral'}`}>{messagesSent > 0 ? '+5% today' : 'No data yet'}</div>
          </div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Engagement Report...', 'info')}>
          <div className="metric-icon purple"><BarChart3 size={24} /></div>
          <div className="metric-content">
            <div className="metric-title">Avg Read Rate</div>
            <div className="metric-value">{avgReadRate}%</div>
            <div className={`metric-trend ${avgReadRate > 0 ? 'positive' : 'neutral'}`}>{avgReadRate > 0 ? 'Highly engaged' : 'No data yet'}</div>
          </div>
        </div>
        <div className="metric-card" onClick={() => showToast('Viewing Automations Report...', 'info')}>
          <div className="metric-icon orange"><Zap size={24} /></div>
          <div className="metric-content">
            <div className="metric-title">Active Automations</div>
            <div className="metric-value">{activeAutomations}</div>
            <div className={`metric-trend ${activeAutomations > 0 ? 'positive' : 'neutral'}`}>{activeAutomations > 0 ? 'Running smoothly' : 'No data yet'}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="chart-section" onClick={() => showToast('Interactive Chart', 'info')}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={20} color="var(--primary-color)"/> Message Activity</h2>
          <div className="chart-container" style={{ width: '100%', height: 300, marginTop: '20px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="messages" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        
        <section className="recent-activity">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={20} color="var(--primary-color)"/> Recent Conversations</h2>
          <div className="activity-list">
             {conversations.length === 0 ? (
               <div style={{color: 'var(--text-muted)', textAlign: 'center', padding: '48px 24px'}}>
                 <MessageSquare size={48} color="var(--border-color)" style={{margin: '0 auto 16px', display: 'block'}} />
                 <p>No recent conversations yet.</p>
               </div>
             ) : (
               <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'}}>
                 {conversations.slice(0, 4).map(chat => (
                   <div key={chat.id} className="activity-item modern">
                     <div className="avatar">{chat.initials}</div>
                     <div className="activity-info">
                       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                         <strong>{chat.name}</strong>
                         <span className="activity-time">{chat.time}</span>
                       </div>
                       <span>{chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'New conversation started'}</span>
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
