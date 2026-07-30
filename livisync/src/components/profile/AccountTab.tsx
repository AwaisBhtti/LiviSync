import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { showToast } from '../../store/slices/toastSlice';
import { useAppDispatch } from '../../store/store';

interface AccountTabProps {
  onLogout: () => void;
}

export const AccountTab = ({ onLogout }: AccountTabProps) => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('livisync_token') || '';

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(showToast({ message: 'New passwords do not match!', type: 'error' }));
      return;
    }
    setPwdLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to change password');
      }
      dispatch(showToast({ message: 'Password updated successfully!', type: 'success' }));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error updating password', type: 'error' }));
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (
      !window.confirm(
        'Are you sure you want to deactivate your account? You will be signed out and your profile will be hidden.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/students/deactivate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to deactivate account');
      }
      dispatch(showToast({ message: 'Account deactivated successfully.', type: 'success' }));
      onLogout();
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error deactivating account', type: 'error' }));
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'WARNING: This action is permanent! Are you sure you want to delete your account? All your match requests and profile data will be permanently wiped.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/students/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      dispatch(showToast({ message: 'Account deleted permanently.', type: 'success' }));
      onLogout();
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error deleting account', type: 'error' }));
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Account Security</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Manage your credentials, or temporarily deactivate/permanently delete your profile.
      </p>

      <form onSubmit={handlePasswordSubmit}>
        <h3 style={sectionTitleStyle}>Update Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: 'fit-content', marginTop: '0.5rem' }}
            disabled={pwdLoading}
          >
            {pwdLoading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>

      <h3 style={{ ...sectionTitleStyle, marginTop: '2.5rem', color: 'var(--danger)' }}>Danger Zone</h3>
      <div
        style={{
          border: '1px solid rgba(244, 63, 94, 0.2)',
          padding: '1.25rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgba(244, 63, 94, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: '1.4' }}>
          Deactivating hides your profile temporarily from roommate search results, while deleting permanently wipes all your match history, chat logs, and account records.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleDeactivate}
            className="btn btn-secondary"
            style={{ color: 'var(--danger)', borderColor: 'rgba(244, 63, 94, 0.3)', flex: 1 }}
          >
            Deactivate Account
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: '1.5rem',
  marginBottom: '1.25rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.5rem',
  color: 'var(--foreground)',
};
