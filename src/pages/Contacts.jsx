import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import { Download, Upload, Plus, Trash2, Search, Users } from 'lucide-react';
import './Contacts.css';

export default function Contacts({ showToast, setCurrentPage }) {
  const [contacts, setContacts] = useLocalStorage('wa_contacts', []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === contacts.length && contacts.length > 0) setSelectedIds([]);
    else setSelectedIds(contacts.map(c => c.id));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleSaveContact = () => {
    if (!formData.phone.trim()) return showToast('Mobile number is mandatory', 'warning');
    
    const newContact = {
      id: Date.now(),
      name: formData.name.trim() || 'Unknown',
      phone: formData.phone.trim(),
      tags: ['Lead'],
      status: 'Opted-In'
    };
    setContacts([newContact, ...contacts]);
    showToast('Contact added successfully!', 'success');
    setIsModalOpen(false);
    setFormData({ name: '', phone: '' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      showToast('Importing contacts from CSV...', 'info');
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const rows = text.split('\n').map(row => row.trim()).filter(row => row);
          if (rows.length <= 1) {
             showToast('CSV is empty or invalid format.', 'error');
             return;
          }
          
          const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
          const nameIndex = headers.findIndex(h => h.includes('name'));
          const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('number'));
          
          if (phoneIndex === -1) {
            showToast('CSV must have a Phone Number column.', 'error');
            return;
          }
          
          const newContacts = [];
          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',').map(c => c.trim());
            const phoneVal = cols[phoneIndex];
            if (phoneVal) {
               newContacts.push({
                 id: Date.now() + i,
                 name: (nameIndex !== -1 && cols[nameIndex]) ? cols[nameIndex] : 'Imported Contact',
                 phone: phoneVal,
                 tags: ['Import'],
                 status: 'Opted-In'
               });
            }
          }
          if (newContacts.length > 0) {
            setContacts([...newContacts, ...contacts]);
            showToast(`Successfully imported ${newContacts.length} contacts!`, 'success');
          } else {
            showToast('No valid contacts found in CSV.', 'warning');
          }
        } catch(err) {
          showToast('Failed to parse CSV file.', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = null; 
    }
  };

  const handleExport = () => {
    if (contacts.length === 0) return showToast('No contacts to export.', 'warning');
    showToast('Preparing CSV file export...', 'info');
    
    setTimeout(() => {
      let csvContent = "Name,PhoneNumber,Status,Tags\n";
      contacts.forEach(c => {
         const row = `"${c.name}","${c.phone}","${c.status}","${c.tags.join('; ')}"\n`;
         csvContent += row;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "contacts_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('contacts_export.csv downloaded!', 'success');
    }, 800);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return showToast('No contacts selected', 'warning');
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} contact(s)?`)) {
      setContacts(contacts.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      showToast(`${selectedIds.length} contacts deleted.`);
    }
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Contacts CRM</h1>
          <p>Manage your audience. Import or export contacts in bulk.</p>
        </div>
        <div className="header-actions">
          {selectedIds.length > 0 && (
            <button className="danger-btn" style={{marginRight: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px'}} onClick={handleDeleteSelected}>
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
          
          <input type="file" accept=".csv" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />
          
          <button className="secondary-btn" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8,Name,PhoneNumber\nJohn Doe,1234567890\nJane Smith,0987654321";
            const link = document.createElement("a");
            link.href = encodeURI(csvContent);
            link.download = "contacts_template.csv";
            link.click();
          }} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
             <Download size={16} /> Download Template
          </button>
          <button className="secondary-btn" onClick={handleExport} disabled={contacts.length === 0} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
             <Download size={16} /> Export CSV
          </button>
          <button className="secondary-btn" onClick={handleImportClick} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
             <Upload size={16} /> Import CSV
          </button>
          <button className="primary-btn" onClick={() => setIsModalOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
             <Plus size={18} /> Add Contact
          </button>
        </div>
      </div>
      
      <div className="contacts-toolbar" style={{marginBottom: '16px', position: 'relative'}}>
        <Search size={18} color="var(--text-muted)" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}} />
        <input 
          type="text" 
          placeholder="Search contacts by name or phone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{width: '100%', maxWidth: '400px', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none'}}
        />
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
            {filteredContacts.map(contact => (
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
            {filteredContacts.length === 0 && contacts.length > 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)'}}>
                  No contacts found matching "{searchTerm}"
                </td>
              </tr>
            )}
            {contacts.length === 0 && (
              <tr>
                 <td colSpan="6">
                   <div style={{textAlign: 'center', padding: '48px 0'}}>
                     <Users size={48} color="var(--border-color)" style={{margin: '0 auto 16px', display: 'block'}} />
                     <h3 style={{marginBottom: '8px', color: 'var(--text-main)', marginTop: 0}}>Your CRM is empty</h3>
                     <p style={{color: 'var(--text-muted)'}}>Upload a CSV file or add your first contact to get started.</p>
                   </div>
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Contact"
        onConfirm={handleSaveContact}
      >
        <div className="form-group">
          <label>Mobile Number <span style={{color: 'var(--danger)'}}>*</span></label>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. +1 234 567 8900" />
        </div>
        <div className="form-group" style={{marginTop: '16px'}}>
          <label>Name <span style={{color: 'var(--text-muted)'}}>(Optional)</span></label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
        </div>
      </Modal>
    </div>
  );
}
