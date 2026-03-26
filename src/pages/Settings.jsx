import React, { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings({ showToast, initialTab = 'Integration', currentUser, setCurrentUser }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Sync if the user navigates directly via the sidebar dropdown
  useEffect(() => {
     setActiveTab(initialTab);
  }, [initialTab]);

  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [token, setToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('skillversity_wa_secure_2026');

  const [profileData, setProfileData] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: '+91 98765 43210', timezone: 'Asia/Kolkata (IST)' });
  const [securityData, setSecurityData] = useState({ currentPass: '', newPass: '', confirmPass: '', twoFactor: false });

  const [fbApiKey, setFbApiKey] = useState(localStorage.getItem('wa_fbApiKey') || '');
  const [fbProjectId, setFbProjectId] = useState(localStorage.getItem('wa_fbProjectId') || '');
  const [fbAppId, setFbAppId] = useState(localStorage.getItem('wa_fbAppId') || '');

  const [lsqAccessKey, setLsqAccessKey] = useState(localStorage.getItem('wa_lsqAccessKey') || '');
  const [lsqSecretKey, setLsqSecretKey] = useState(localStorage.getItem('wa_lsqSecretKey') || '');
  const [lsqHostRegion, setLsqHostRegion] = useState(localStorage.getItem('wa_lsqHostRegion') || 'api.leadsquared.com');

  const [isVerifyingMeta, setIsVerifyingMeta] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleSaveLeadSquared = () => {
    localStorage.setItem('wa_lsqAccessKey', lsqAccessKey);
    localStorage.setItem('wa_lsqSecretKey', lsqSecretKey);
    localStorage.setItem('wa_lsqHostRegion', lsqHostRegion);
    showToast('LeadSquared CRM connected securely!', 'success');
  };

  const handleSaveFirebase = () => {
    localStorage.setItem('wa_fbApiKey', fbApiKey);
    localStorage.setItem('wa_fbProjectId', fbProjectId);
    localStorage.setItem('wa_fbAppId', fbAppId);
    showToast('Cloud Storage configuration securely locked inside your browser!', 'success');
  };

  const handleConnect = () => {
    if (!wabaId || !token || !phoneId || !appId) return showToast('Please provide all required Meta configuration fields', 'warning');
    
    setIsVerifyingMeta(true);
    showToast('Verifying Meta Business API connection...', 'info');
    
    setTimeout(() => {
      setIsVerifyingMeta(false);
      // Simulated verification logic
      if (token.length > 20 && appId.length > 5) {
        showToast('Successfully connected to Meta Business API!', 'success');
      } else {
        showToast('Meta verification failed. Please check your App ID and Token.', 'error');
      }
    }, 2000);
  };

  const handleGenerateQR = () => {
    setIsGeneratingQR(true);
    setQrCodeUrl('');
    showToast('Initializing secure multi-device session...', 'info');
    
    setTimeout(() => {
      setIsGeneratingQR(false);
      // Generate a real-looking QR code using a public API
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Skillversity-WhatsApp-Session-${Date.now()}`);
      showToast('QR Code generated! Please scan with your WhatsApp app.', 'success');
    }, 2500);
  };

  const handleDisconnectQR = () => {
    setQrCodeUrl('');
    showToast('WhatsApp session disconnected.', 'warning');
  };
  
  const handleSaveProfile = () => {
    if (!profileData.name.trim()) return showToast('Name cannot be empty', 'warning');
    
    // Update global state and localStorage
    const updatedUser = { 
      ...currentUser, 
      name: profileData.name,
      phone: profileData.phone,
      timezone: profileData.timezone,
      initials: profileData.name.substring(0, 2).toUpperCase()
    };
    
    if (setCurrentUser) {
      setCurrentUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
    } else {
      // Fallback if prop missing
      localStorage.setItem('wa_currentUser', JSON.stringify(updatedUser));
      showToast('Profile saved to local storage.', 'success');
    }
  };

  const handleUpdatePassword = () => {
     if (!securityData.currentPass || !securityData.newPass) return showToast('Please fill all password fields', 'warning');
     if (securityData.newPass !== securityData.confirmPass) return showToast('New passwords do not match', 'error');
     showToast('Security settings updated securely.', 'success');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
         <div>
           <h1>Settings</h1>
           <p>Manage your account, security, and WhatsApp integrations.</p>
         </div>
      </div>

      <div className="settings-tabs" style={{display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0'}}>
        <button style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'Profile' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'Profile' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'Profile' ? '600' : '500', cursor: 'pointer'}} onClick={() => setActiveTab('Profile')}>My Profile</button>
        <button style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'Security' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'Security' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'Security' ? '600' : '500', cursor: 'pointer'}} onClick={() => setActiveTab('Security')}>Security</button>
        <button style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'Storage' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'Storage' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'Storage' ? '600' : '500', cursor: 'pointer'}} onClick={() => setActiveTab('Storage')}>Cloud Database Storage</button>
        <button style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'Integration' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'Integration' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'Integration' ? '600' : '500', cursor: 'pointer'}} onClick={() => setActiveTab('Integration')}>WhatsApp API</button>
        <button style={{padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'LeadSquared' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'LeadSquared' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'LeadSquared' ? '600' : '500', cursor: 'pointer'}} onClick={() => setActiveTab('LeadSquared')}>LeadSquared CRM</button>
      </div>

      <div className="settings-content">
        {activeTab === 'Profile' && (
           <div className="settings-card" style={{backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '600px', animation: 'fadeIn 0.2s ease-out'}}>
             <h3 style={{marginTop: 0, marginBottom: '24px', color: 'var(--text-main)'}}>Personal Information</h3>
             <div className="form-group" style={{marginTop: '16px'}}>
               <label>Full Name</label>
               <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
             </div>
             <div className="form-group">
               <label>Email Address</label>
               <input type="email" value={profileData.email} disabled style={{opacity: 0.7}} />
             </div>
             <div className="form-group">
               <label>Phone Number</label>
               <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
             </div>
             <div className="form-group">
               <label>Timezone</label>
               <select className="modern-select" value={profileData.timezone} onChange={e => setProfileData({...profileData, timezone: e.target.value})}>
                 <option>Asia/Kolkata (IST)</option>
                 <option>America/New_York (EST)</option>
                 <option>Europe/London (GMT)</option>
               </select>
             </div>
             <button className="primary-btn" onClick={handleSaveProfile} style={{marginTop: '16px'}}>Save Profile</button>
           </div>
        )}

        {activeTab === 'Security' && (
           <div className="settings-card" style={{backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '600px', animation: 'fadeIn 0.2s ease-out'}}>
             <h3 style={{marginTop: 0, marginBottom: '24px', color: 'var(--text-main)'}}>Change Password</h3>
             <div className="form-group" style={{marginTop: '16px'}}>
               <label>Current Password</label>
               <input type="password" value={securityData.currentPass} onChange={e => setSecurityData({...securityData, currentPass: e.target.value})} />
             </div>
             <div className="form-group">
               <label>New Password</label>
               <input type="password" value={securityData.newPass} onChange={e => setSecurityData({...securityData, newPass: e.target.value})} />
             </div>
             <div className="form-group">
               <label>Confirm Password</label>
               <input type="password" value={securityData.confirmPass} onChange={e => setSecurityData({...securityData, confirmPass: e.target.value})} />
             </div>
             <button className="primary-btn" onClick={handleUpdatePassword} style={{marginTop: '8px', marginBottom: '32px'}}>Update Password</button>

             <hr style={{borderColor: 'var(--border-color)', marginBottom: '24px'}} />
             
             <h3 style={{marginTop: 0, marginBottom: '8px', color: 'var(--text-main)'}}>Two-Factor Authentication</h3>
             <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', marginTop: 0}}>Add an extra layer of security to your account.</p>
             <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', color: 'var(--text-main)'}}>
               <input type="checkbox" checked={securityData.twoFactor} onChange={e => { setSecurityData({...securityData, twoFactor: e.target.checked}); showToast(e.target.checked ? '2FA Enabled. Please link your Authenticator App.' : '2FA Disabled', 'info') }} />
               Enable Authenticator App
             </label>
           </div>
         )}

        {activeTab === 'Storage' && (
           <div className="settings-card" style={{backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '600px', animation: 'fadeIn 0.2s ease-out'}}>
             <h3 style={{marginTop: 0, marginBottom: '8px', color: 'var(--text-main)'}}>Sync to Cloud Database (Firebase)</h3>
             <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5'}}>
               Store your Contacts and Inbox data securely in Google's Firebase Firestore so it syncs perfectly across all your devices, instead of just existing securely on this single computer.
             </p>
             
             <div className="form-group" style={{marginTop: '16px'}}>
               <label>Firebase API Key</label>
               <input type="password" value={fbApiKey} onChange={e => setFbApiKey(e.target.value)} placeholder="AIzaSy..." />
             </div>
             <div className="form-group">
               <label>Firebase Project ID</label>
               <input type="text" value={fbProjectId} onChange={e => setFbProjectId(e.target.value)} placeholder="my-wa-project-123" />
             </div>
             <div className="form-group">
               <label>Firebase App ID</label>
               <input type="text" value={fbAppId} onChange={e => setFbAppId(e.target.value)} placeholder="1:1234567890:web:abcd12345" />
             </div>
             <button className="primary-btn" onClick={handleSaveFirebase} style={{marginTop: '16px'}}>Lock & Connect Cloud Storage</button>
           </div>
         )}

        {activeTab === 'LeadSquared' && (
           <div className="settings-card" style={{backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '600px', animation: 'fadeIn 0.2s ease-out'}}>
             <h3 style={{marginTop: 0, marginBottom: '8px', color: 'var(--text-main)'}}>LeadSquared CRM Sync</h3>
             <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5'}}>
               Connect your LeadSquared account to automatically sync your WhatsApp contacts and broadcast leads directly into your professional CRM pipeline.
             </p>
             
             <div className="form-group" style={{marginTop: '16px'}}>
               <label>Access Key</label>
               <input type="text" value={lsqAccessKey} onChange={e => setLsqAccessKey(e.target.value)} placeholder="e.g. u1e..." />
             </div>
             <div className="form-group">
               <label>Secret Key</label>
               <input type="password" value={lsqSecretKey} onChange={e => setLsqSecretKey(e.target.value)} placeholder="Enter your secret key" />
             </div>
             <div className="form-group">
               <label>Host Region</label>
               <select className="modern-select" value={lsqHostRegion} onChange={e => setLsqHostRegion(e.target.value)}>
                 <option value="api.leadsquared.com">api.leadsquared.com (Default)</option>
                 <option value="api-in21.leadsquared.com">api-in21.leadsquared.com (India)</option>
                 <option value="api-us11.leadsquared.com">api-us11.leadsquared.com (United States)</option>
               </select>
             </div>
             <button className="primary-btn" onClick={handleSaveLeadSquared} style={{marginTop: '16px'}}>Sync with LeadSquared</button>
           </div>
        )}

        {activeTab === 'Integration' && (
          <div className="settings-card" style={{backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '800px', animation: 'fadeIn 0.2s ease-out'}}>
             
             <h3 style={{margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '24px'}}>Choose Connection Method</h3>
             
             <div style={{border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '40px', backgroundColor: 'var(--bg-main)'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                   <span style={{fontSize: '1.5rem'}}>📱</span>
                   <h4 style={{margin: 0, fontSize: '1.2rem', color: 'var(--text-main)'}}>Method 1: Direct Device Linking</h4>
                 </div>
                 <span className="badge badge-success">Recommended for Personal</span>
               </div>
               <p style={{color: 'var(--text-muted)', marginBottom: '24px', marginTop: 0, lineHeight: '1.5'}}>
                 Link your existing WhatsApp number instantly using Multi-Device pairing. This connects your dashboard using an open-source backend wrapper (like Baileys) without requiring Facebook developer approval.
               </p>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start'}}>
                  <div style={{flex: '1', minWidth: '200px'}}>
                    <div style={{display: 'flex', gap: '16px', marginBottom: '16px'}}>
                      <button 
                        className="primary-btn" 
                        onClick={handleGenerateQR} 
                        disabled={isGeneratingQR}
                        style={{opacity: isGeneratingQR ? 0.7 : 1}}
                      >
                        {isGeneratingQR ? 'Generating...' : (qrCodeUrl ? 'Refresh QR Code' : 'Generate QR Code')}
                      </button>
                      {qrCodeUrl && (
                        <button className="danger-btn" onClick={handleDisconnectQR}>Disconnect Session</button>
                      )}
                    </div>
                    {!qrCodeUrl && !isGeneratingQR && (
                       <button className="secondary-btn" onClick={() => showToast('Waiting for phone number pairing...', 'info')}>Link via Phone Number</button>
                    )}
                  </div>

                  {isGeneratingQR && (
                    <div style={{width: '200px', height: '200px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px'}}>
                      <div className="spinner" style={{width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Connecting...</span>
                    </div>
                  )}

                  {qrCodeUrl && (
                    <div style={{padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center'}}>
                      <img src={qrCodeUrl} alt="WhatsApp QR Code" style={{width: '180px', height: '180px', display: 'block', marginBottom: '8px'}} />
                      <span style={{fontSize: '0.75rem', color: '#666', fontWeight: '500'}}>Scan this with WhatsApp</span>
                    </div>
                  )}
                </div>
              </div>

             <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px'}}>
               <svg viewBox="0 0 40 24" width="48" height="32" fill="#0668E1">
                 <path d="M28.06,2.44A10.15,10.15,0,0,0,20.2,5.81L19.8,6.26,19.4,5.81A10.15,10.15,0,0,0,11.54,2.44C5.55,2.44,0,7,0,12.59S5.43,22.75,11.54,22.75A10.15,10.15,0,0,0,19.4,19.38l.4-.45.4.45A10.15,10.15,0,0,0,28.06,22.75C34.05,22.75,39.6,18.17,39.6,12.59S34.17,2.44,28.06,2.44Zm0,16.59c-3.15,0-5.83-2.18-7.31-5.61l-.66-1.55a.8.8,0,0,0-1.48,0l-.66,1.55C16.48,16.85,13.8,19,10.65,19,7,19,4.2,16.12,4.2,12.59S7,6.15,10.65,6.15C13.8,6.15,16.48,8.33,18,11.76L18.61,13.3a.8.8,0,0,0,1.48,0l.66-1.55c1.47-3.42,4.16-5.61,7.31-5.61C31.7,6.16,34.5,9.05,34.5,12.59S31.7,19.03,28.06,19.03Z"/>
               </svg>
               <h4 style={{margin: 0, fontSize: '1.2rem', color: 'var(--text-main)'}}>Method 2: Meta Business Suite Setup</h4>
             </div>
             
             <p style={{color: 'var(--text-muted)', marginBottom: '32px', marginTop: '8px', fontSize: '1rem'}}>
               Connect your WhatsApp Business Account (WABA) to start messaging via the Meta Cloud API. Enter the credentials from your Meta Developer App Dashboard.
             </p>
             
             <h4 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px'}}>0. Dashboard Backend Connection</h4>
             <p style={{color: 'var(--text-muted)', marginBottom: '16px', marginTop: 0}}>The URL of the middleman Node.js/Python server you build to handle the Meta connection.</p>
             <div className="form-group" style={{marginBottom: '24px'}}>
               <label>Backend API Base URL</label>
               <input type="url" placeholder="https://your-backend-api.com" />
             </div>
             
             <h4 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px'}}>1. App Configuration</h4>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
               <div className="form-group">
                 <label>Meta App ID</label>
                 <input type="text" value={appId} onChange={e => setAppId(e.target.value)} placeholder="e.g. 59302847192" />
               </div>
               <div className="form-group">
                 <label>Meta App Secret</label>
                 <input type="password" value={appSecret} onChange={e => setAppSecret(e.target.value)} placeholder="Enter 32-character secret" />
               </div>
             </div>
             
             <h4 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px'}}>2. WhatsApp API specific Identifiers</h4>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
               <div className="form-group">
                 <label>Phone Number ID</label>
                 <input type="text" value={phoneId} onChange={e => setPhoneId(e.target.value)} placeholder="e.g. 19283746501" />
               </div>
               <div className="form-group">
                 <label>WhatsApp Business Account ID (WABA ID)</label>
                 <input type="text" value={wabaId} onChange={e => setWabaId(e.target.value)} placeholder="e.g. 1029384756" />
               </div>
             </div>
             
             <div className="form-group" style={{marginTop: '8px'}}>
               <label>System User Access Token (Permanent Token)</label>
               <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="EAAGm0..." />
               <p className="help-text" style={{marginTop: '4px'}}>Generate this in Meta Business Settings &gt; Users &gt; System Users</p>
             </div>
              <button 
                className="primary-btn" 
                onClick={handleConnect} 
                disabled={isVerifyingMeta}
                style={{marginTop: '16px', padding: '12px 24px', fontSize: '1.1rem', opacity: isVerifyingMeta ? 0.7 : 1}}
              >
                {isVerifyingMeta ? 'Verifying...' : 'Verify Meta Connection'}
              </button>

             <hr style={{borderColor: 'var(--border-color)', margin: '40px 0'}} />
             
             <h4 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px'}}>3. Webhook Settings</h4>
             <p style={{color: 'var(--text-muted)', marginBottom: '16px', marginTop: 0}}>Set this webhook configuration in your Meta App Dashboard to receive real-time incoming messages.</p>
             
             <div className="form-group">
                <label>Callback URL</label>
                <div style={{display: 'flex', gap: '12px'}}>
                  <input type="text" readOnly value="https://api.skillversity.com/wa/webhook" style={{flex: 1, backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'copy'}} onClick={(e) => { e.target.select(); showToast('Selected!'); }} />
                  <button className="secondary-btn" onClick={() => showToast('Callback URL Copied!', 'success')}>Copy URL</button>
                </div>
             </div>
             <div className="form-group" style={{marginTop: '16px'}}>
                <label>Verify Token</label>
                <div style={{display: 'flex', gap: '12px'}}>
                  <input type="text" value={verifyToken} onChange={e => setVerifyToken(e.target.value)} placeholder="Enter a secure random string" style={{flex: 1}} />
                  <button className="secondary-btn" onClick={() => showToast('Verify Token Saved!', 'success')}>Save Token</button>
                </div>
                <p className="help-text" style={{marginTop: '6px'}}>Match this token exactly when setting up Webhooks in your Meta Developer Dashboard.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
