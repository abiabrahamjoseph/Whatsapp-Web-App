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
  const [modalType, setModalType] = useState('User'); // 'User' or 'Role'
  const [editingItem, setEditingItem] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'Agent' });
  const [roleFormData, setRoleFormData] = useState({ name: '', desc: '' });

  const handleOpenModal = (item = null) => {
    if (activeTab === 'Users') {
      setModalType('User');
      if (item) {
        setEditingItem(item);
        setUserFormData({ name: item.name, email: item.email, role: item.role });
      } else {
        setEditingItem(null);
        setUserFormData({ name: '', email: '', role: 'Agent' });
      }
    } else {
      setModalType('Role');
      if (item) {
        setEditingItem(item);
        setRoleFormData({ name: item.name, desc: item.desc });
      } else {
        setEditingItem(null);
        setRoleFormData({ name: '', desc: '' });
      }
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalType === 'User') {
      if (!userFormData.name.trim() || !userFormData.email.trim()) return showToast('Name and Email are required', 'warning');
      
      if (editingItem) {
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === editingItem.id ? { ...u, ...userFormData, initials: userFormData.name.substring(0,2).toUpperCase() } : u
        ));
        showToast('User updated successfully!');
      } else {
        const newUser = {
          id: Date.now(),
          ...userFormData,
          initials: userFormData.name.substring(0,2).toUpperCase(),
          status: 'Active',
          time: 'Just now'
        };
        setUsers([...users, newUser]);
        showToast(`User ${userFormData.name} created!`);
      }
    } else {
      if (!roleFormData.name.trim() || !roleFormData.desc.trim()) return showToast('Role Name and Description are required', 'warning');
      
      if (editingItem) {
        setRoles(prevRoles => prevRoles.map(r => 
          r.id === editingItem.id ? { ...r, ...roleFormData } : r
        ));
        showToast('Role updated successfully!');
      } else {
        const newRole = {
          id: Date.now(),
          ...roleFormData,
          count: 0,
          system: false
        };
        setRoles([...roles, newRole]);
        showToast(`Role "${roleFormData.name}" created!`);
      }
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
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          {activeTab === 'Users' ? '+ Create User' : '+ Create Role'}
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
                          <button className="icon-btn" onClick={() => handleOpenModal(r)} title="Edit">✏️</button>
                          <button className="icon-btn" onClick={() => handleDeleteRole(r.id)} title="Delete">🗑️</button>
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
        title={modalType === 'User' ? (editingItem ? "Edit User" : "Create User") : (editingItem ? "Edit Role" : "Create Role")}
        onConfirm={handleSave}
        confirmText={editingItem ? "Save Changes" : (modalType === 'User' ? "Create User" : "Create Role")}
      >
        {modalType === 'User' ? (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} placeholder="e.g. User Name" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} placeholder="e.g. user@domain.com" />
            </div>
            <div className="form-group">
              <label>Assign Role</label>
              <select className="modern-select" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
                {roles.map(r => <option key={r.id}>{r.name}</option>)}
              </select>
              <p className="help-text" style={{marginTop: '8px'}}>Choose a role for this user to define their access permissions.</p>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Role Name</label>
              <input type="text" value={roleFormData.name} onChange={e => setRoleFormData({...roleFormData, name: e.target.value})} placeholder="e.g. Support Manager" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={roleFormData.desc} 
                onChange={e => setRoleFormData({...roleFormData, desc: e.target.value})} 
                placeholder="e.g. Full access to all support tickets and messaging."
                style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical'}}
                rows={4}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
