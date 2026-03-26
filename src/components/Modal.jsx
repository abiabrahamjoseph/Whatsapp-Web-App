import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = 'Save' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
