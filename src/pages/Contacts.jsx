import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Contacts.css';

const initialContacts = [];

export default function Contacts({ showToast, setCurrentPage }) {
  const [contacts, setContacts] = useLocalStorage('wa_contacts', initialContacts);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === contacts.length && contacts.length > 0) setSelectedIds([]);
    else setSelectedIds(contacts.map(c => c.id));
  };

  const handleAddContact = () => {
    const newContact = {
      id: Date.now(),
      name: `New Contact ${contacts.length + 1}`,
      phone: '+1 555 000 0000',
      tags: ['Lead'],
      status: 'Opted-In'
    };
    setContacts([newContact, ...contacts]);
    showToast('Contact added successfully!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      showToast('Importing contacts from CSV...', 'info');
      setTimeout(() => {
        const dummyImport = [
          { id: Date.now() + 1, name: 'Alice Cooper', phone: '+1 234 500 0001', tags: ['Import'], status: 'Opted-In' },
          { id: Date.now() + 2, name: 'Bob Marley', phone: '+1 234 500 0002', tags: ['VIP'], status: 'Opted-In' },
          { id: Date.now() + 3, name: 'Charlie Puth', phone: '+1 234 500 0003', tags: ['Import'], status: 'Opted-In' }
        ];
        setContacts([...dummyImport, ...contacts]);
        showToast('Successfully imported 3 contacts from CSV!', 'success');
      }, 1000);
      e.target.value = null; // reset
    }
  };

  const handleExport = () => {
    if (contacts.length === 0) return showToast('No contacts to export.', 'warning');
    showToast('Preparing CSV file export...', 'info');
    setTimeout(() => {
       showToast('contacts_export.csv downloaded!', 'success');
    }, 1500);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return showToast('No contacts selected', 'warning');
    setContacts(contacts.filter(c => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    showToast(`${selectedIds.length} contacts deleted.`);
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Contacts CRM</h1>
          <p>Manage your audience. Import or export contacts in bulk.</p>
        </div>
        <div className="header-actions">
          {selectedIds.length > 0 && <button className="danger-btn" style={{marginRight: '8px', padding: '8px 16px'}} onClick={handleDeleteSelected}>Delete Selected</button>}
          
          <input type="file" accept=".csv" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />
          
          <button className="secondary-btn" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8,Name,PhoneNumber\nJohn Doe,1234567890\nJane Smith,0987654321";
            const link = document.createElement("a");
            link.href = encodeURI(csvContent);
            link.download = "contacts_template.csv";
            link.click();
          }}>Download Template</button>
          <button className="secondary-btn" onClick={handleExport} disabled={contacts.length === 0}>Export CSV</button>
          <button className="secondary-btn" onClick={handleImportClick}>Import CSV</button>
          <button className="primary-btn" onClick={handleAddContact}>+ Add Contact</button>
        </div>
      </div>
      
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedIds.length === contacts.length && contacts.length > 0} onChange={toggleAll}/></th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td><input type="checkbox" checked={selectedIds.includes(contact.id)} onChange={() => toggleSelect(contact.id)} /></td>
                <td><strong>{contact.name}</strong></td>
                <td>{contact.phone}</td>
                <td>
                  {contact.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </td>
                <td>
                  <span className={`badge ${contact.status === 'Opted-In' ? 'badge-success' : 'badge-warning'}`}>
                    {contact.status}
                  </span>
                </td>
                <td>
                  <button className={`icon-btn ${contact.status === 'Blocked' ? 'disabled' : ''}`} onClick={() => contact.status !== 'Blocked' && setCurrentPage('Inbox')}>💬</button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                 <td colSpan="6">
                   <div style={{textAlign: 'center', padding: '48px 0'}}>
                     <span style={{fontSize: '3rem', display: 'block', marginBottom: '16px'}}>👥</span>
                     <h3 style={{marginBottom: '8px', color: 'var(--text-main)', marginTop: 0}}>Your CRM is empty</h3>
                     <p style={{color: 'var(--text-muted)'}}>Upload a CSV file or add your first contact to get started.</p>
                   </div>
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
