import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import { Search, Edit, Send, Paperclip, FileText, CheckCircle2, UserCircle, MessageCircle, Mic, Square } from 'lucide-react';
import './Inbox.css';

const initialConversations = [];

export default function Inbox({ showToast }) {
  const [conversations, setConversations] = useLocalStorage('wa_conversations', initialConversations);
  const [activeContactId, setActiveContactId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState({});
  const messagesEndRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [contactsList, setContactsList] = useState([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [usersList, setUsersList] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (isModalOpen) {
      setContactsList(JSON.parse(localStorage.getItem('wa_contacts') || '[]'));
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isAssignModalOpen) {
      setUsersList(JSON.parse(localStorage.getItem('wa_users') || '[]'));
    }
  }, [isAssignModalOpen]);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    
    socket.on('message', (incomingMsg) => {
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(c => c.name.replace(/\D/g, '') === incomingMsg.from.replace(/\D/g, ''));
        const newMessage = { id: incomingMsg.id, text: incomingMsg.text, type: 'received', time: incomingMsg.time, msgType: incomingMsg.msgType, audio: incomingMsg.audio };
        
        if (existingConvIndex >= 0) {
          const convs = [...prev];
          const activeConv = convs.splice(existingConvIndex, 1)[0];
          activeConv.messages.push(newMessage);
          activeConv.time = incomingMsg.time;
          return [activeConv, ...convs];
        } else {
          // New conversation
          const newConv = {
            id: Date.now(),
            name: incomingMsg.from,
            initials: incomingMsg.name ? incomingMsg.name.substring(0, 2).toUpperCase() : 'WA',
            status: 'Online',
            time: incomingMsg.time,
            messages: [newMessage]
          };
          return [newConv, ...prev];
        }
      });
      // Optionally showToast('New message received!', 'success');
    });

    return () => socket.disconnect();
  }, []);

  const activeConversation = conversations.find(c => c.id === activeContactId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;
    
    const newMsg = {
      id: Date.now(),
      text: messageInput,
      type: 'sent',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    const currentActiveId = activeContactId;
    const phone = activeConversation.name;
    
    const updatedConvs = conversations.map(c => {
      if (c.id === currentActiveId) {
        return { ...c, messages: [...c.messages, newMsg], time: 'Just now' };
      }
      return c;
    });
    
    const activeIndex = updatedConvs.findIndex(c => c.id === currentActiveId);
    if (activeIndex > 0) {
      const activeC = updatedConvs.splice(activeIndex, 1)[0];
      updatedConvs.unshift(activeC);
    }

    setConversations(updatedConvs);
    setMessageInput('');
    setIsTyping(prev => ({...prev, [currentActiveId]: true}));

    try {
      await fetch('http://localhost:3001/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, text: messageInput })
      });
      showToast('Message sent');
    } catch (e) {
      showToast('Failed to send message via backend', 'error');
    } finally {
      setIsTyping(prev => ({...prev, [currentActiveId]: false}));
    }
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

  const handleAssignChat = () => {
    if (!selectedAssignee) return showToast('Please select a team member', 'warning');
    
    const assigneeName = usersList.find(u => u.id.toString() === selectedAssignee)?.name || selectedAssignee;
    
    setConversations(conversations.map(c => 
      c.id === activeContactId ? { ...c, assignedTo: assigneeName } : c
    ));
    
    setIsAssignModalOpen(false);
    setSelectedAssignee('');
    showToast(`Chat assigned to ${assigneeName}`, 'success');
  };

  const handleResolveChat = () => {
    setConversations(conversations.map(c => 
      c.id === activeContactId ? { ...c, status: 'Resolved' } : c
    ));
    showToast('Ticket marked as resolved', 'success');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      showToast('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = (audioBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64AudioMessage = reader.result;
      const currentActiveId = activeContactId;
      const phone = activeConversation.name;

      const newMsg = {
        id: Date.now(),
        text: 'Voice Note',
        type: 'sent',
        msgType: 'audio',
        audio: base64AudioMessage,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setConversations(prev => {
        const updated = prev.map(c => c.id === currentActiveId ? { ...c, messages: [...c.messages, newMsg], time: 'Just now' } : c);
        const idx = updated.findIndex(c => c.id === currentActiveId);
        if (idx > 0) {
          const act = updated.splice(idx, 1)[0];
          updated.unshift(act);
        }
        return updated;
      });

      try {
        await fetch('http://localhost:3001/api/send-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: phone, audioBase64: base64AudioMessage })
        });
        showToast('Voice note sent');
      } catch (e) {
        showToast('Failed to send audio via backend', 'error');
      }
    };
  };

  return (
    <div className="inbox-container">
      <div className="contact-list">
        <div className="contact-list-header">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <h2 style={{margin: 0, fontSize: '1.2rem', color: 'var(--text-main)'}}>Messages</h2>
            <button className="icon-btn" title="New Chat" onClick={() => setIsModalOpen(true)}>
              <Edit size={18} />
            </button>
          </div>
          <div className="inbox-filters" style={{marginTop: '12px', position: 'relative'}}>
            <Search size={16} color="var(--text-muted)" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}} />
            <input 
              type="text" 
              placeholder="Search chats by name..." 
              value={chatSearchTerm}
              onChange={(e) => setChatSearchTerm(e.target.value)}
              className="search-input" 
              style={{width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)'}}
            />
          </div>
        </div>
        <div className="contacts">
          {conversations.filter(c => c.name.toLowerCase().includes(chatSearchTerm.toLowerCase())).map(contact => (
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
                <div className="contact-preview" style={{ fontWeight: isTyping[contact.id] ? '600' : 'normal', color: isTyping[contact.id] ? 'var(--primary-color)' : 'var(--text-muted)'}}>
                  {isTyping[contact.id] ? 'typing...' : (contact.messages.length > 0 ? contact.messages[contact.messages.length - 1].text : 'Start a conversation')}
                </div>
                {contact.assignedTo && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCircle size={12}/> {contact.assignedTo}
                  </div>
                )}
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
                  <h2 style={{display: 'flex', alignItems: 'center', gap: '6px'}}>{activeConversation.name} {activeConversation.status === 'Online' && <CheckCircle2 size={16} color="var(--primary-color)"/>}</h2>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span className={`status ${activeConversation.status.toLowerCase()}`}>
                      {isTyping[activeConversation.id] ? 'typing...' : `● ${activeConversation.status}`}
                    </span>
                    {activeConversation.assignedTo && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCircle size={14}/> Assigned to {activeConversation.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="secondary-btn" onClick={() => setIsAssignModalOpen(true)} title="Assign Ticket" style={{padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px'}}><UserCircle size={16}/> Assign</button>
                <button className="secondary-btn" onClick={handleResolveChat} style={{display: 'flex', alignItems: 'center', gap: '6px'}}><CheckCircle2 size={16}/> Resolve</button>
              </div>
            </div>
            
            <div className="chat-messages">
              {activeConversation.messages.map((msg, idx) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <div className="message-content">
                    {msg.msgType === 'audio' || msg.audio ? (
                      <audio src={msg.audio} controls style={{maxWidth: '220px', height: '40px'}} />
                    ) : (
                      msg.text
                    )}
                  </div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
              {isTyping[activeConversation.id] && (
                 <div className="message received typing-indicator-bubble">
                   <div className="message-content typing-dots">
                     <span></span><span></span><span></span>
                   </div>
                 </div>
              )}
              {activeConversation.messages.length === 0 && (
                 <div style={{textAlign: 'center', alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto', color: 'var(--text-muted)', backgroundColor: 'var(--bg-panel)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                   Say hello to {activeConversation.name}!
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <button type="button" className="icon-btn" onClick={() => showToast('Attachment menu opened')}><Paperclip size={20}/></button>
              
              {isRecording ? (
                <div style={{flex: 1, display: 'flex', alignItems: 'center', color: 'red', gap: '8px', padding: '0 12px', fontWeight: 'bold'}}>
                  ● Recording audio...
                </div>
              ) : (
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
              )}
              
              <button type="button" className="icon-btn" onClick={() => showToast('Template selector opened')}><FileText size={20}/></button>
              
              {isRecording ? (
                 <button type="button" className="icon-btn" style={{color: 'red'}} onClick={stopRecording} title="Stop & Send"><Square size={20}/></button>
              ) : (
                 <button type="button" className="icon-btn" onClick={startRecording} title="Record Voice Note"><Mic size={20}/></button>
              )}
              
              {!isRecording && <button type="submit" className="primary-btn" disabled={!messageInput.trim()} style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Send size={16}/> Send</button>}
            </form>
          </>
        ) : (
          <div className="empty-chat" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--bg-panel)'}}>
            <MessageCircle size={64} color="var(--border-color)" style={{marginBottom: '16px'}} />
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
        {contactsList.length > 0 && (
          <>
            <div className="form-group" style={{marginBottom: '16px'}}>
              <label>Select from Contacts</label>
              <select 
                className="modern-select" 
                onChange={e => setNewChatPhone(e.target.value)}
                value={newChatPhone}
              >
                <option value="">-- Choose a saved contact --</option>
                {contactsList.map(c => (
                  <option key={c.id} value={c.phone}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div style={{ textAlign: 'center', margin: '12px 0 16px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>OR</div>
          </>
        )}
        <div className="form-group">
          <label>Enter WhatsApp Number</label>
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

      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Assign Chat to Team Member"
        onConfirm={handleAssignChat}
        confirmText="Assign"
      >
        <div className="form-group">
          <label>Select Team Member</label>
          <select 
            className="modern-select" 
            onChange={e => setSelectedAssignee(e.target.value)}
            value={selectedAssignee}
          >
            <option value="">-- Choose a team member --</option>
            {usersList.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
          <p className="help-text" style={{marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>The selected member will be notified and this chat will appear in their queue.</p>
        </div>
      </Modal>
    </div>
  );
}
