import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import type { User, Report, Hostel } from '../types';
import { Building, Users, ShieldAlert, CheckCircle, Ban, RefreshCw } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { ConfirmationModal } from './ConfirmationModal';

interface AdminPanelProps {
  users: User[];
  reports: Report[];
  hostels: Hostel[];
  onToggleUserStatus: (userId: string) => void;
  onResolveReport: (reportId: string) => void;
  onWarnUser: (reportId: string) => void;
  onDeleteUser: (userId: string) => void;
  onVerifyHostel: (hostelId: string) => void;
}

// Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  position: 'relative',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const statsRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1.5rem',
};

const statCardStyle: React.CSSProperties = {
  padding: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  fontWeight: 500,
  letterSpacing: '0.05em',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  marginTop: '0.25rem',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.75rem',
  marginBottom: '1rem',
};

const tableContainerStyle: React.CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  maxHeight: '400px',
  overflowY: 'auto',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '2px solid var(--border)',
};

const thStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  padding: '0.75rem 1rem',
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--card)',
  zIndex: 10,
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
  verticalAlign: 'middle',
};

const smallAvatarStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const tableBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  gap: '0.25rem',
};

export const AdminPanel = ({
  users,
  reports,
  hostels,
  onToggleUserStatus,
  onResolveReport,
  onWarnUser,
  onDeleteUser,
  onVerifyHostel,
}: AdminPanelProps) => {
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const getPriceRangeString = (hostel: Hostel) => {
    if (!hostel.rooms || hostel.rooms.length === 0) return 'Rooms not listed';
    const prices = hostel.rooms.map(r => r.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) return `PKR ${minPrice.toLocaleString()}`;
    return `PKR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
  };

  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  const [studentSearch, setStudentSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [hostelSearch, setHostelSearch] = useState('');

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch(`${API_BASE_URL}/admin/invitations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRevokeInvitation = async (token: string) => {
    try {
      const userToken = localStorage.getItem('livisync_token');
      const response = await fetch(`${API_BASE_URL}/admin/invitations/${token}/revoke`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (response.ok) {
        fetchInvitations();
      }
    } catch (err) {
      console.error("Error revoking invitation:", err);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setGeneratedLink('');
    setInviteLoading(true);
    setCopied(false);

    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch(`${API_BASE_URL}/admin/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate invite');
      }
      setInvitedEmail(inviteEmail);
      setGeneratedLink(data.invite_link);
      setInviteEmail('');
      setShowModal(true);
      fetchInvitations();
    } catch (err: any) {
      setInviteError(err.message || 'Error occurred');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getReporterName = (reporterId: string) => {
    return users.find((u) => u.id === reporterId)?.name || 'Unknown User';
  };

  const getReportedUser = (reportedId: string) => {
    return users.find((u) => u.id === reportedId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={headerStyle}>
        <h1>Admin Control Panel</h1>
        <p style={{ color: 'var(--muted)' }}>Manage student safety, view usage analytics, and moderate reports.</p>
      </div>

      {/* Analytics Row */}
      <div style={statsRowStyle}>
        <div className="card" style={statCardStyle}>
          <Users size={20} style={{ color: 'var(--muted)' }} />
          <div>
            <span style={statLabelStyle}>Total Students</span>
            <h2 style={statValueStyle}>{users.filter(u => u.role === 'student').length}</h2>
          </div>
        </div>

        <div className="card" style={statCardStyle}>
          <Users size={20} style={{ color: 'var(--muted)' }} />
          <div>
            <span style={statLabelStyle}>Hostel Owners</span>
            <h2 style={statValueStyle}>{users.filter(u => u.role === 'owner').length}</h2>
          </div>
        </div>

        <div className="card" style={statCardStyle}>
          <Building size={20} style={{ color: 'var(--muted)' }} />
          <div>
            <span style={statLabelStyle}>Active Hostels</span>
            <h2 style={statValueStyle}>{hostels.length}</h2>
          </div>
        </div>

        <div className="card" style={statCardStyle}>
          <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
          <div>
            <span style={statLabelStyle}>Pending Reports</span>
            <h2 style={statValueStyle}>{pendingReports.length}</h2>
          </div>
        </div>
      </div>

      {/* Reports Moderation Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <ShieldAlert size={18} /> Pending Safety Reports
        </h3>
        {pendingReports.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
            No pending safety reports. The platform is secure.
          </p>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Reporter</th>
                  <th style={thStyle}>Reported Profile</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((report) => {
                  const reported = getReportedUser(report.reportedId);
                  return (
                    <tr key={report.id} style={tableRowStyle}>
                      <td style={tdStyle}>
                        <span 
                          style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }} 
                          onClick={() => {
                            const repUser = users.find(u => u.id === report.reporterId);
                            if (repUser) setSelectedUserDetail(repUser);
                          }}
                        >
                          {getReporterName(report.reporterId)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                          onClick={() => {
                            if (reported) setSelectedUserDetail(reported);
                          }}
                        >
                          <img src={reported?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} style={smallAvatarStyle} alt="" />
                          <div>
                            <span style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline' }}>{reported?.name}</span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: reported?.status === 'suspended' ? 'var(--danger)' : 'var(--success)' }}>
                              {reported?.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {report.reason.replace('-', ' ')}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--muted)', fontSize: '0.8rem', maxWidth: '240px', wordWrap: 'break-word' }}>
                        {report.description}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            className="btn btn-primary"
                            style={tableBtnStyle}
                            onClick={() => onResolveReport(report.id)}
                          >
                            <CheckCircle size={12} /> Resolve
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={tableBtnStyle}
                            onClick={() => onWarnUser(report.id)}
                          >
                            ✉ Warn
                          </button>
                          {reported && (
                            <button
                              className="btn btn-danger"
                              style={tableBtnStyle}
                              onClick={() => onToggleUserStatus(reported.id)}
                            >
                              <Ban size={12} /> {reported.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Helper to get status text color */}
      {(() => {
        const getStatusColor = (status: string) => {
          if (status === 'suspended') return 'var(--danger)';
          if (status === 'unapproved') return '#f59e0b';
          return 'var(--success)';
        };

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
            {/* Student Directory Management */}
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
                    {students.map((user) => (
                      <tr key={user.id} style={tableRowStyle}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} style={smallAvatarStyle} alt="" />
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
                          <span style={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: user.is_email_verified ? 'var(--success)' : '#d97706',
                            backgroundColor: user.is_email_verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            border: '1px solid ' + (user.is_email_verified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'),
                            display: 'inline-block'
                          }}>
                            {user.is_email_verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: getStatusColor(user.status)
                          }}>
                            {user.status.toUpperCase()}
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
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                  }
                                });
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--muted)' }}>
                          No students registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hostel Owner Directory Management */}
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
                    {owners.map((user) => (
                      <tr key={user.id} style={tableRowStyle}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{user.name}</td>
                        <td style={tdStyle}>{user.email}</td>
                        <td style={tdStyle}>{user.phone || 'N/A'}</td>
                        <td style={tdStyle}>
                          <span style={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: getStatusColor(user.status)
                          }}>
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={tableBtnStyle}
                              onClick={() => onToggleUserStatus(user.id)}
                            >
                              <RefreshCw size={12} /> {user.status === 'active' ? 'Suspend' : 'Approve'}
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
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                  }
                                });
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
          </>
        );
      })()}

      {/* Invite Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <Users size={18} /> Invite Hostel Owners
        </h3>
        <form onSubmit={handleGenerateInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
            <label className="form-label">Owner Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="owner@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={inviteLoading} style={{ height: '42px' }}>
            {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>

        {inviteError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{inviteError}</p>}

        {/* Active Invitations List */}
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Generated Invitations
          </h4>
          {invitations.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No invitation links generated yet.</p>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>Recipient Email</th>
                    <th style={thStyle}>Invitation Token</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.token} style={tableRowStyle}>
                      <td style={{ ...tdStyle, fontSize: '0.85rem' }}>{inv.email}</td>
                      <td style={{ ...tdStyle, fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--muted)' }}>
                        {inv.token.substring(0, 8)}...{inv.token.substring(inv.token.length - 8)}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: inv.is_used ? 'var(--muted)' : 'var(--success)'
                        }}>
                          {inv.is_used ? 'REVOKED / USED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {!inv.is_used && (
                          <button
                            className="btn btn-danger"
                            style={{ ...tableBtnStyle, padding: '0.25rem 0.5rem' }}
                            onClick={() => handleRevokeInvitation(inv.token)}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Link Modal Popup */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Invitation Link Generated</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
              An invitation email has been sent to <strong>{invitedEmail}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Copy Registration Link
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="form-input"
                  style={{ flex: 1, backgroundColor: 'var(--secondary)', cursor: 'default' }}
                />
                <button
                  onClick={handleCopyLink}
                  className={`btn ${copied ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ whiteSpace: 'nowrap', minWidth: '80px' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Listings Moderation */}
      {(() => {
        const filteredHostels = hostels.filter(
          (h) => !h.isVerified && h.name.toLowerCase().includes(hostelSearch.toLowerCase().trim())
        );

        return (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={sectionTitleStyle}>
              <Building size={18} /> Hostel Listings Verification
            </h3>
            <div style={{ marginBottom: '1rem', width: '100%', maxWidth: '320px' }}>
              <input
                type="text"
                placeholder="Search hostel by name..."
                className="form-input"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', width: '100%' }}
                value={hostelSearch}
                onChange={(e) => setHostelSearch(e.target.value)}
              />
            </div>
            {filteredHostels.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
                No pending hostels for verification matching search.
              </p>
            ) : (
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>Hostel Name</th>
                      <th style={thStyle}>Location</th>
                      <th style={thStyle}>Rent (PKR)</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHostels.map((hostel) => (
                  <tr key={hostel.id} style={tableRowStyle}>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => setSelectedHostel(hostel)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline', textAlign: 'left' }}
                        title="Click to view details"
                      >
                        {hostel.name}
                      </button>
                    </td>
                    <td style={tdStyle}>{hostel.location}</td>
                    <td style={tdStyle}>{getPriceRangeString(hostel)}</td>
                    <td style={tdStyle}>
                      <button
                        className="btn btn-primary"
                        style={tableBtnStyle}
                        onClick={() => onVerifyHostel(hostel.id)}
                      >
                        <CheckCircle size={12} /> Verify Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  })()}

      {selectedHostel && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Hostel Details</h3>
              <button
                type="button"
                onClick={() => setSelectedHostel(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              {selectedHostel.photo && (
                <img
                  src={selectedHostel.photo}
                  alt={selectedHostel.name}
                  onClick={() => setLightboxUrl(selectedHostel.photo)}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'zoom-in' }}
                />
              )}

              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{selectedHostel.name}</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>📍 {selectedHostel.location}</p>
              </div>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Description</h5>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>{selectedHostel.description || 'No description provided.'}</p>
              </div>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Amenities</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedHostel.amenities.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>No amenities specified.</span>
                  ) : (
                    selectedHostel.amenities.map((a, i) => (
                      <span key={i} className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        ✓ {a}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Available Rooms ({selectedHostel.rooms?.length || 0})</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {!selectedHostel.rooms || selectedHostel.rooms.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>No rooms listed yet.</span>
                  ) : (
                    selectedHostel.rooms.map((room, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                          <span>{room.sharingType} Sharing ({room.floor})</span>
                          <span style={{ color: 'var(--primary)' }}>PKR {room.price.toLocaleString()} / mo</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                          <span>🛋️ {room.furniture === 'nothing' ? 'Unfurnished' : room.furniture === 'mattress' ? 'Mattress Provided' : 'Furnished (Bed)'}</span>
                          <span>• 🚿 {room.hasAttachedBathroom ? 'Attached Bath' : 'Shared Bath'}</span>
                          <span>• 🛏️ {room.seatsAvailable} bed(s) available</span>
                        </div>
                        {room.description && (
                          <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                            "{room.description}"
                          </p>
                        )}
                        {room.images && room.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                            {room.images.filter(img => img.trim().length > 0).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                onClick={() => setLightboxUrl(img)}
                                style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px', cursor: 'zoom-in' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {!selectedHostel.isVerified && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      onVerifyHostel(selectedHostel.id);
                      setSelectedHostel(null);
                    }}
                  >
                    Verify & Approve Listing
                  </button>
                )}
                <button type="button" className="btn btn-secondary" style={{ flex: !selectedHostel.isVerified ? 0.3 : 1 }} onClick={() => setSelectedHostel(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUserDetail && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Student Profile Details</h3>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={selectedUserDetail.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'}
                  alt=""
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selectedUserDetail.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {selectedUserDetail.age} y/o • {selectedUserDetail.gender}
                  </span>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>Contact Information</h5>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>📧 Email: {selectedUserDetail.email}</p>
                {selectedUserDetail.phone && <p style={{ margin: 0, fontSize: '0.875rem' }}>📞 Phone: {selectedUserDetail.phone}</p>}
              </div>

              {selectedUserDetail.bio && (
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>Biography</h5>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--muted)' }}>{selectedUserDetail.bio}</p>
                </div>
              )}

              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>Living & Study Details</h5>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>📍 Preferred Location: {selectedUserDetail.location}</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>💰 Max Budget: PKR {selectedUserDetail.budget?.toLocaleString()} / mo</p>
                <p style={{ margin: 0, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                  💼 Occupation: {selectedUserDetail.occupation} 
                  {selectedUserDetail.institution && ` at ${selectedUserDetail.institution}`}
                  {selectedUserDetail.company && ` at ${selectedUserDetail.company}`}
                </p>
              </div>

              {selectedUserDetail.preferences && (
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--muted)' }}>Lifestyle Habits</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      🛌 Sleep: {selectedUserDetail.preferences.sleepSchedule || 'flexible'}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      🧹 Cleanliness: {selectedUserDetail.preferences.cleanliness || 'moderate'}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      🚬 Smoking: {selectedUserDetail.preferences.smoking || 'no'}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      🐾 Pets: {selectedUserDetail.preferences.pets || 'no'}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      👥 Guests: {selectedUserDetail.preferences.guestTolerance || 'weekends'}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedUserDetail(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
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
    </div>
  );
};
