import type { User, Report, Hostel, MatchRequest } from '../types';
import { Building, Users, ShieldAlert, CheckCircle, Ban, RefreshCw, Star } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  reports: Report[];
  hostels: Hostel[];
  matchRequests: MatchRequest[];
  onToggleUserStatus: (userId: string) => void;
  onResolveReport: (reportId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminPanel = ({
  users,
  reports,
  hostels,
  matchRequests,
  onToggleUserStatus,
  onResolveReport,
  onDeleteUser,
}: AdminPanelProps) => {
  const activeMatchesCount = matchRequests.filter((r) => r.status === 'accepted').length;
  const pendingReports = reports.filter((r) => r.status === 'pending');

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
            <h2 style={statValueStyle}>{users.filter(u => u.role !== 'admin').length}</h2>
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
          <Star size={20} style={{ color: 'var(--muted)' }} />
          <div>
            <span style={statLabelStyle}>Confirmed Matches</span>
            <h2 style={statValueStyle}>{activeMatchesCount}</h2>
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
                      <td style={tdStyle}>{getReporterName(report.reporterId)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={reported?.photo} style={smallAvatarStyle} alt="" />
                          <div>
                            <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{reported?.name}</span>
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

      {/* User Directory Management */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <Users size={18} /> User Management & Directory
        </h3>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Student Profile</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Account Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={tableRowStyle}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={user.photo} style={smallAvatarStyle} alt="" />
                      <div>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{user.name}</span>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {user.age} y/o • {user.gender}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{user.location}</td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{user.role}</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: user.status === 'suspended' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {user.role !== 'admin' && (
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
                            if (confirm(`Are you sure you want to delete ${user.name}'s account?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Styles
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
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
};

const thStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  padding: '0.75rem 1rem',
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
