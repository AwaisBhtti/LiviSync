import { API_BASE_URL } from '../config';
import { useState } from 'react';
import type { Admin } from '../types';
import { User as UserIcon, Settings, Save } from 'lucide-react';

interface AdminProfileProps {
  currentUser: Admin;
}

export const AdminProfile = ({ currentUser: _currentUser }: AdminProfileProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('livisync_token');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update password');
      }
      setSuccessMsg('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating password');
    }
  };

  return (
    <div className="split-layout">
      {/* Settings Navigation/Sidebar */}
      <div style={sidebarStyle} className="mobile-hide">
        <div style={sidebarHeaderStyle}>
          <UserIcon size={18} />
          <h4>Admin Security</h4>
        </div>
        <div style={sidebarItemStyle(true)}>
          <Settings size={14} />
          Change Password
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Security Settings</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Change your administrator password to keep the account secure.
        </p>

        <form onSubmit={handlePasswordChange}>
          {errorMsg && (
            <div style={{ color: 'var(--destructive)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ color: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {successMsg}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} />
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const sidebarStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const sidebarHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderBottom: '1px solid var(--border)',
  marginBottom: '0.5rem',
};

const sidebarItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: 'var(--radius)',
  backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  cursor: 'pointer',
});
