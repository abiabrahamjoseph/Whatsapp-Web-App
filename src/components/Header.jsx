import React, { useState } from 'react';
import './Header.css';

export default function Header({ showToast, setCurrentPage, currentUser }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Campaign Completed', message: 'Summer Sale broadcast delivered successfuly to 4,200 active contacts.', time: '10m ago', unread: true, type: 'success' },
    { id: 2, title: 'New Meta Policy', message: 'WhatsApp utility and authenticated pricing limits have been updated for 2026.', time: '2h ago', unread: true, type: 'warning' },
    { id: 3, title: 'Lead Captured', message: 'Alice responded positively to your latest Welcome Workflow Automation.', time: '1d ago', unread: false, type: 'info' }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({...n, unread: false})));
    showToast('All notifications marked as read', 'info');
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="app-header">
      <div className="header-search">
         <span className="search-icon">🔍</span>
         <input type="text" placeholder="Search contacts, campaigns, or workflows..." />
      </div>
      
      <div className="header-actions">
         <div style={{position: 'relative'}} onMouseLeave={() => isNotificationsOpen && setTimeout(() => setIsNotificationsOpen(false), 500)}>
           <button className="icon-btn" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} title="Notifications">
             🔔
             {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
           </button>
           
           {isNotificationsOpen && (
             <div className="notifications-dropdown" onMouseEnter={() => setIsNotificationsOpen(true)}>
               <div className="notifications-header">
                 <h4>Notifications</h4>
                 {unreadCount > 0 && <button className="text-btn" onClick={markAllRead}>Mark all read</button>}
               </div>
               
               <div className="notifications-list">
                 {notifications.length === 0 ? (
                   <div className="empty-notifications">
                     <span style={{fontSize: '2rem', display: 'block', marginBottom: '8px'}}>📭</span>
                     <p>You're all caught up!</p>
                   </div>
                 ) : (
                   notifications.map(notif => (
                     <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`} onClick={() => {
                        setNotifications(notifications.map(n => n.id === notif.id ? {...n, unread: false} : n));
                     }}>
                       <div className={`notification-icon bg-${notif.type}`}>
                         {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}
                       </div>
                       <div className="notification-content">
                         <h5>{notif.title}</h5>
                         <p>{notif.message}</p>
                         <small>{notif.time}</small>
                       </div>
                       <button className="close-btn" onClick={(e) => removeNotification(e, notif.id)} title="Dismiss">✕</button>
                     </div>
                   ))
                 )}
               </div>
               
               {notifications.length > 0 && (
                 <div className="notifications-footer" onClick={() => { setIsNotificationsOpen(false); showToast('Viewing all application activity history...', 'info'); }}>
                   View All Activity Log
                 </div>
               )}
             </div>
           )}
         </div>
         
         <button className="icon-btn" onClick={() => showToast('Help Center opened')} title="Help">❓</button>
      </div>
    </header>
  );
}
