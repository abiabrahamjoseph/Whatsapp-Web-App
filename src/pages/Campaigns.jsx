import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import './Campaigns.css';

const initialCampaigns = [];

export default function Campaigns({ showToast }) {
  const [activeTab, setActiveTab] = useState('Broadcasts');
  const [campaigns, setCampaigns] = useLocalStorage('wa_campaigns', initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', type: 'Marketing', status: 'Draft', message: '', file: null });

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,PhoneNumber\nJohn Doe,1234567890\nJane Smith,0987654321";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenModal = (camp = null) => {
    if (camp) {
      setEditingCampaign(camp);
      setFormData({ name: camp.name, type: camp.type, status: camp.status, message: camp.message || '', file: null });
    } else {
      setEditingCampaign(null);
      setFormData({ name: '', type: 'Marketing', status: 'Draft', message: '', file: null });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return showToast('Name is required', 'warning');
    
    if (editingCampaign) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...formData } : c));
      showToast('Campaign updated successfully!');
    } else {
      const newCamp = {
        id: Date.now(),
        ...formData,
        sent: '0',
        readRate: '0%',
        date: 'Just now'
      };
      setCampaigns([newCamp, ...campaigns]);
      showToast('Campaign created successfully!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    showToast('Campaign deleted.', 'warning');
  };

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <div>
          <h1>Campaigns & Automations</h1>
          <p>Manage your broadcasts and automated workflows.</p>
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()}>+ Create Campaign</button>
      </div>

      <div className="campaigns-tabs">
        <button className={activeTab === 'Broadcasts' ? 'active' : ''} onClick={() => setActiveTab('Broadcasts')}>Broadcasts</button>
        <button className={activeTab === 'Auto-Replies' ? 'active' : ''} onClick={() => setActiveTab('Auto-Replies')}>Auto-Replies</button>
        <button className={activeTab === 'Workflows' ? 'active' : ''} onClick={() => setActiveTab('Workflows')}>Workflows</button>
      </div>

      <div className="campaigns-table-wrapper">
        <table className="campaigns-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Sent</th>
              <th>Read Rate</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(camp => (
              <tr key={camp.id}>
                <td>
                  <div className="campaign-name">
                    <strong>{camp.name}</strong>
                    <span>{camp.type}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${camp.status === 'Completed' ? 'badge-success' : camp.status === 'Active' ? 'badge-info' : 'badge-warning'}`}>
                    {camp.status}
                  </span>
                </td>
                <td>{camp.sent}</td>
                <td>{camp.readRate}</td>
                <td>{camp.date}</td>
                <td>
                  <button className="icon-btn" onClick={() => showToast('Viewing Analytics Dashboard...', 'info')} title="Analytics">📊</button>
                  <button className="icon-btn" onClick={() => handleOpenModal(camp)} title="Edit">✏️</button>
                  <button className="icon-btn" onClick={() => handleDelete(camp.id)} title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
               <tr><td colSpan="6" style={{textAlign: 'center', padding: '32px'}}>No campaigns found. Create one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCampaign ? "Edit Campaign" : "Create Campaign"}
        onConfirm={handleSave}
      >
        <div className="form-group">
          <label>Campaign Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Summer Sale Announce" />
        </div>
        <div className="form-group">
          <label>Campaign Type</label>
          <select className="modern-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option>Marketing</option>
            <option>Utility</option>
            <option>Authentication</option>
            <option>Automation</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="modern-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
             <option>Draft</option>
             <option>Active</option>
             <option>Completed</option>
             <option>Paused</option>
          </select>
        </div>
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Message Content</label>
          <textarea 
            rows="3" 
            value={formData.message} 
            onChange={e => setFormData({...formData, message: e.target.value})} 
            placeholder="Type your broadcast message here..."
            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit', marginTop: '8px'}}
          ></textarea>
        </div>
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Upload Contacts</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
            <input type="file" accept=".csv" onChange={e => setFormData({...formData, file: e.target.files[0]})} style={{fontSize: '0.9rem'}}/>
            <button type="button" onClick={handleDownloadTemplate} style={{ color: 'var(--primary-color)', textDecoration: 'underline', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
              Download CSV Template
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
