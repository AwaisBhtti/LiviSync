/** AdminUsersTable — Student Directory + Hostel Owner Directory tables with ConfirmationModal. */
import { useState } from 'react';
import type { User } from '../../types';
import { Users, RefreshCw } from 'lucide-react';
import { ConfirmationModal } from '../ConfirmationModal';
import {
  sectionTitleStyle,
  tableContainerStyle,
  tableStyle,
  tableHeaderRowStyle,
  thStyle,
  tableRowStyle,
  tdStyle,
  tableBtnStyle,
  smallAvatarStyle,
  DEFAULT_AVATAR,
} from '../../styles/commonStyles';

interface AdminUsersTableProps {
  users: User[];
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const getStatusColor = (status: string) => {
  if (status === 'suspended') return 'var(--danger)';
  if (status === 'unapproved') return '#f59e0b';
  return 'var(--success)';
};

export const AdminUsersTable = ({
  users,
  onToggleUserStatus,
  onDeleteUser,
}: AdminUsersTableProps) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const students = users.filter((u) => {
    if (u.role !== 'student') return false;
    const term = studentSearch.toLowerCase().trim();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const owners = users.filter((u) => {
    if (u.role !== 'owner') return false;
    const term = ownerSearch.toLowerCase().trim();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <>
      {/* Student Directory */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <Users size={18} /> Student Directory
        </h3>
        <div style={{ marginBottom: '1rem', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search student by name or email..."
            className="form-input"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', width: '100%' }}
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />
        </div>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Student Profile</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Email Status</th>
                <th style={thStyle}>Account Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((user) => {
                const status = user.status ?? 'active';
                return (
                  <tr key={user.id} style={tableRowStyle}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={user.photo || DEFAULT_AVATAR} style={smallAvatarStyle} alt="" />
                        <div>
                          <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{user.name}</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)' }}>
                            {user.age} y/o • {user.gender} • {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>{user.location}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: user.is_email_verified ? 'var(--success)' : '#8c491a',
                          backgroundColor: user.is_email_verified
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          border:
                            '1px solid ' +
                            (user.is_email_verified
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)'),
                          display: 'inline-block',
                        }}
                      >
                        {user.is_email_verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          color: getStatusColor(status),
                        }}
                      >
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={tableBtnStyle}
                          onClick={() => onToggleUserStatus(user.id)}
                        >
                          <RefreshCw size={12} /> Toggle Suspend
                        </button>
                        <button
                          className="btn btn-danger"
                          style={tableBtnStyle}
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Student Account',
                              message: `Are you sure you want to delete ${user.name}'s account? This action is permanent.`,
                              confirmText: 'Delete',
                              isDanger: true,
                              onConfirm: () => {
                                onDeleteUser(user.id);
                                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--muted)' }}>
                    No students registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Owner Directory */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <Users size={18} /> Hostel Owner Directory
        </h3>
        <div style={{ marginBottom: '1rem', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search owner by name or email..."
            className="form-input"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', width: '100%' }}
            value={ownerSearch}
            onChange={(e) => setOwnerSearch(e.target.value)}
          />
        </div>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Owner Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Verification Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((user) => {
                const status = user.status ?? 'active';
                return (
                  <tr key={user.id} style={tableRowStyle}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{user.name}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>{user.phone || 'N/A'}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          color: getStatusColor(status),
                        }}
                      >
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={tableBtnStyle}
                          onClick={() => onToggleUserStatus(user.id)}
                        >
                          <RefreshCw size={12} /> {status === 'active' ? 'Suspend' : 'Approve'}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={tableBtnStyle}
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Owner Account',
                              message: `Are you sure you want to delete owner ${user.name}? This action is permanent.`,
                              confirmText: 'Delete',
                              isDanger: true,
                              onConfirm: () => {
                                onDeleteUser(user.id);
                                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {owners.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--muted)' }}>
                    No owners registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModal.isOpen && (
        <ConfirmationModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </>
  );
};
