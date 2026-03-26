import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import './Inbox.css';

const initialConversations = [];

export default function Inbox({ showToast }) {
  const [conversations, setConversations] = useLocalStorage('wa_conversations', initialConversations);
  const [activeContactId, setActiveContactId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');

  const activeConversation = conversations.find(c => c.id === activeContactId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;
    
    const newMsg = {
      id: Date.now(),
      text: messageInput,
      type: 'sent',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    const updatedConvs = conversations.map(c => {
      if (c.id === activeContactId) {
        return { ...c, messages: [...c.messages, newMsg], time: 'Just now' };
      }
      return c;
    });
    
    // Move active to top
    const activeIndex = updatedConvs.findIndex(c => c.id === activeContactId);
    if (activeIndex > 0) {
      const activeC = updatedConvs.splice(activeIndex, 1)[0];
      updatedConvs.unshift(activeC);
    }

    setConversations(updatedConvs);
    setMessageInput('');
    showToast('Message sent');
    
    // Simulate auto-reply payload payload
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id === activeContactId) {
          return {
            ...c, 
            messages: [...c.messages, { id: Date.now()+1, text: 'This is an automated sandbox reply. The WhatsApp Cloud API is running smoothly.', type: 'received', time: 'Just now' }]
          };
        }
        return c;
      }));
    }, 2000);
  };

  const handleStartNewChat = () => {
     if (!newChatPhone.trim()) return showToast('Please enter a WhatsApp number', 'warning');
     
     const newConv = {
       id: Date.now(),
       name: newChatPhone,
       initials: 'WA',
       status: 'Online',
       time: 'Just now',
       messages: []
     };
     
     setConversations([newConv, ...conversations]);
     setActiveContactId(newConv.id);
     setIsModalOpen(false);
     setNewChatPhone('');
  };

  return (
    <div className="inbox-container">
      <div className="contact-list">
        <div className="contact-list-header">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <h2 style={{margin: 0, fontSize: '1.2rem', color: 'var(--text-main)'}}>Messages</h2>
            <button className="icon-btn" title="New Chat" onClick={() => setIsModalOpen(true)}>📝</button>
          </div>
          <div className="inbox-filters" style={{marginTop: '12px'}}>
            <input type="text" placeholder="Search chats..." className="search-input" style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)'}}/>
          </div>
        </div>
        <div className="contacts">
          {conversations.map(contact => (
            <div 
              key={contact.id} 
              className={`contact-item ${activeContactId === contact.id ? 'active' : ''}`}
              onClick={() => setActiveContactId(contact.id)}
            >
              <div className="avatar">{contact.initials}</div>
              <div className="contact-info">
                <div className="contact-header">
                  <strong>{contact.name}</strong>
                  <span className="time">{contact.time}</span>
                </div>
                <div className="contact-preview">
                  {contact.messages.length > 0 ? contact.messages[contact.messages.length - 1].text : 'Start a conversation'}
                </div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
             <div style={{padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)'}}>
               <button className="secondary-btn" style={{width: '100%'}} onClick={() => setIsModalOpen(true)}>+ Start a Chat</button>
               <p style={{marginTop: '16px', fontSize: '0.9rem'}}>No active conversations</p>
             </div>
          )}
        </div>
      </div>

      <div className="chat-area">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="avatar">{activeConversation.initials}</div>
                <div>
                  <h2>{activeConversation.name}</h2>
                  <span className={`status ${activeConversation.status.toLowerCase()}`}>● {activeConversation.status}</span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="secondary-btn" onClick={() => showToast('Assigning to team member...', 'info')} title="Assign Ticket" style={{padding: '8px 16px'}}>Assign</button>
                <button className="secondary-btn" onClick={() => showToast('Closing ticket...', 'success')}>Resolve</button>
              </div>
            </div>
            
            <div className="chat-messages">
              {activeConversation.messages.map((msg, idx) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <div className="message-content">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
              {activeConversation.messages.length === 0 && (
                 <div style={{textAlign: 'center', alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto', color: 'var(--text-muted)', backgroundColor: 'var(--bg-panel)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                   Say hello to {activeConversation.name}!
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <button type="button" className="icon-btn" onClick={() => showToast('Attachment menu opened')}>📎</button>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="button" className="icon-btn" onClick={() => showToast('Template selector opened')}>📄</button>
              <button type="submit" className="primary-btn" disabled={!messageInput.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className="empty-chat" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--bg-panel)'}}>
            <div style={{fontSize: '4rem', marginBottom: '16px', opacity: 0.8}}>💬</div>
            <h2 style={{color: 'var(--text-main)', margin: '0 0 8px 0'}}>WA Messenger Inbox</h2>
            <p style={{color: 'var(--text-muted)', margin: 0}}>Select a conversation from the left or start a new chat.</p>
            <button className="primary-btn" style={{marginTop: '24px', padding: '12px 24px', fontSize: '1.1rem'}} onClick={() => setIsModalOpen(true)}>+ Start New Chat</button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Start New Chat"
        onConfirm={handleStartNewChat}
        confirmText="Start Chat"
      >
        <div className="form-group">
          <label>WhatsApp Number</label>
          <input 
            type="text" 
            value={newChatPhone} 
            onChange={e => setNewChatPhone(e.target.value)} 
            placeholder="e.g. +1 555 123 4567" 
            autoFocus
          />
          <p className="help-text" style={{marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Ensure you include the country code (e.g., +1 for US, +91 for India).</p>
        </div>
      </Modal>
    </div>
  );
}
