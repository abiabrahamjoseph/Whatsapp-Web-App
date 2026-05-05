import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import './Users.css';

export default function Users({ showToast, currentUser }) {
  const [users, setUsers] = useLocalStorage('wa_users', [
    { id: 1, name: currentUser?.name || 'Admin', email: currentUser?.email || 'admin@wapphost.com', password: 'Wa2026$$', initials: currentUser?.initials || 'A', role: 'Admin', status: 'Active', time: 'Just now' }
  ]);

  const [roles] = useLocalStorage('wa_roles', [
    { id: 1, name: 'Admin', desc: 'Full access to all system settings, billing, and users.', count: 1, system: true, permissions: [] }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'Agent' });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setUserFormData({ name: item.name, email: item.email, password: item.password || '', role: item.role });
    } else {
      setEditingItem(null);
      setUserFormData({ name: '', email: '', password: '', role: 'Agent' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!userFormData.name.trim() || !userFormData.email.trim() || !userFormData.password?.trim()) return showToast('Name, Email and Password are required', 'warning');
    
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
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    showToast('User removed.', 'warning');
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage your team members and users.</p>
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          + Create User
        </button>
      </div>

      <div className="users-content">
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
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Edit User" : "Create User"}
        onConfirm={handleSave}
        confirmText={editingItem ? "Save Changes" : "Create User"}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} placeholder="e.g. User Name" />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} placeholder="e.g. user@domain.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="text" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} placeholder="Set user password" />
        </div>
        <div className="form-group">
          <label>Assign Role</label>
          <select className="modern-select" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
            {roles.map(r => <option key={r.id}>{r.name}</option>)}
          </select>
          <p className="help-text" style={{marginTop: '8px'}}>Choose a role for this user to define their access permissions.</p>
        </div>
      </Modal>
    </div>
  );
}
