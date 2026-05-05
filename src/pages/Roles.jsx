import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import './Roles.css';

const AVAILABLE_PAGES = ['Dashboard', 'Inbox', 'Broadcasts', 'Automations', 'Contacts', 'Users', 'Roles', 'Settings'];

export default function Roles({ showToast }) {
  const [roles, setRoles] = useLocalStorage('wa_roles', [
    { id: 1, name: 'Admin', desc: 'Full access to all system settings, billing, and users.', count: 1, system: true, permissions: AVAILABLE_PAGES }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', desc: '', permissions: [] });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      // Map legacy "Users & Roles" permission to "Users" and "Roles" for the UI if needed
      let mappedPermissions = item.permissions || [];
      if (mappedPermissions.includes('Users & Roles')) {
        mappedPermissions = mappedPermissions.filter(p => p !== 'Users & Roles');
        if (!mappedPermissions.includes('Users')) mappedPermissions.push('Users');
        if (!mappedPermissions.includes('Roles')) mappedPermissions.push('Roles');
      }
      setRoleFormData({ name: item.name, desc: item.desc, permissions: mappedPermissions });
    } else {
      setEditingItem(null);
      setRoleFormData({ name: '', desc: '', permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
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
    setIsModalOpen(false);
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
    showToast('Role deleted.', 'warning');
  };

  return (
    <div className="roles-page">
      <div className="page-header">
        <div>
          <h1>Roles & Permissions</h1>
          <p>Manage roles and their access permissions.</p>
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          + Create Role
        </button>
      </div>

      <div className="roles-content">
        <div className="data-table-wrapper">
           <table className="data-table">
            <thead>
              <tr><th>Role Name</th><th>Description</th><th>Access</th><th>Users Attached</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {roles.map(r => {
                const legacyFixedLength = r.permissions?.includes('Users & Roles') ? r.permissions.length + 1 : r.permissions?.length;
                return (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.desc}</td>
                  <td>{r.permissions ? (legacyFixedLength >= AVAILABLE_PAGES.length ? 'All Modules' : `${legacyFixedLength} Modules`) : 'All Modules'}</td>
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
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Edit Role" : "Create Role"}
        onConfirm={handleSave}
        confirmText={editingItem ? "Save Changes" : "Create Role"}
      >
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
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Page Access Permissions</label>
          <div className="permissions-grid">
            {AVAILABLE_PAGES.map(page => (
              <label key={page} className="permission-item">
                <input 
                  type="checkbox" 
                  checked={roleFormData.permissions.includes(page)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRoleFormData({...roleFormData, permissions: [...roleFormData.permissions, page]});
                    } else {
                      setRoleFormData({...roleFormData, permissions: roleFormData.permissions.filter(p => p !== page)});
                    }
                  }}
                />
                <span>{page}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
