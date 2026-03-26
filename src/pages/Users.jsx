import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import './Users.css';

export default function Users({ showToast, currentUser }) {
  const [activeTab, setActiveTab] = useState('Users');
  
  const [users, setUsers] = useLocalStorage('wa_users', [
    { id: 1, name: currentUser?.name || 'Admin', email: currentUser?.email || 'admin@wapphost.com', initials: currentUser?.initials || 'A', role: 'Admin', status: 'Active', time: 'Just now' }
  ]);

  const [roles, setRoles] = useLocalStorage('wa_roles', [
    { id: 1, name: 'Admin', desc: 'Full access to all system settings, billing, and users.', count: 1, system: true }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Agent' });

  const handleOpenModal = (user = null) => {
    if (activeTab !== 'Users') return showToast('Role editing via modal not implemented yet.', 'info');
    
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'Agent' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) return showToast('Name and Email are required', 'warning');
    
    if (editingUser) {
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === editingUser.id ? { ...u, ...formData, initials: formData.name.substring(0,2).toUpperCase() } : u
      ));
      showToast('User updated successfully!');
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        initials: formData.name.substring(0,2).toUpperCase(),
        status: 'Pending',
        time: 'Never'
      };
      setUsers([...users, newUser]);
      showToast(`Invitation sent to ${formData.email}!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    showToast('User removed.', 'warning');
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
    showToast('Role deleted.', 'warning');
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>Users & Roles</h1>
          <p>Manage your team members and access permissions.</p>
        </div>
        <button className="primary-btn" onClick={() => activeTab === 'Users' ? handleOpenModal() : showToast('Role creation modal not implemented yet.', 'info')}>
          {activeTab === 'Users' ? '+ Invite User' : '+ Create Role'}
        </button>
      </div>

      <div className="users-tabs">
        <button 
          className={activeTab === 'Users' ? 'active' : ''} 
          onClick={() => setActiveTab('Users')}
        >
          Team Members
        </button>
        <button 
          className={activeTab === 'Roles' ? 'active' : ''} 
          onClick={() => setActiveTab('Roles')}
        >
          Roles & Permissions
        </button>
      </div>

      <div className="users-content">
        {activeTab === 'Users' && (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Status</th><th>Last Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{u.initials}</div>
                        <div className="user-details">
                          <strong>{u.name}</strong><span>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{u.role}</td>
                    <td><span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{u.status}</span></td>
                    <td>{u.time}</td>
                    <td>
                      <button className="icon-btn" onClick={() => handleOpenModal(u)} title="Edit">✏️</button>
                      {u.role !== 'Admin' && <button className="icon-btn" onClick={() => handleDeleteUser(u.id)} title="Delete">🗑️</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Roles' && (
          <div className="data-table-wrapper">
             <table className="data-table">
              <thead>
                <tr><th>Role Name</th><th>Description</th><th>Users Attached</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{r.desc}</td>
                    <td>{r.count} User(s)</td>
                    <td>
                      {r.system ? (
                        <button className="icon-btn disabled" title="System Role Cannot Be Edited">🔒</button>
                      ) : (
                        <>
                          <button className="icon-btn" onClick={() => showToast('Edit Role panel opened', 'info')}>✏️</button>
                          <button className="icon-btn" onClick={() => handleDeleteRole(r.id)}>🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Edit User" : "Invite User"}
        onConfirm={handleSave}
        confirmText={editingUser ? "Save Changes" : "Send Invite"}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. User Name" />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. user@domain.com" />
        </div>
        <div className="form-group">
          <label>Assign Role</label>
          <select className="modern-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option>Admin</option>
            <option>Manager</option>
            <option>Agent</option>
          </select>
          <p className="help-text" style={{marginTop: '8px'}}>Agents can only send and receive messages. Admins have full billing access.</p>
        </div>
      </Modal>
    </div>
  );
}
