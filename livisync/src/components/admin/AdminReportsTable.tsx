/** AdminReportsTable — Pending Safety Reports section in the Admin Panel. */
import type { User, Report } from '../../types';
import { ShieldAlert, CheckCircle, Ban } from 'lucide-react';
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

interface AdminReportsTableProps {
  reports: Report[];
  users: User[];
  onResolveReport: (reportId: string) => void;
  onWarnUser: (reportId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onSelectUser: (user: User) => void;
}

export const AdminReportsTable = ({
  reports,
  users,
  onResolveReport,
  onWarnUser,
  onToggleUserStatus,
  onSelectUser,
}: AdminReportsTableProps) => {
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const getReporterName = (reporterId: string) =>
    users.find((u) => u.id === reporterId)?.name || 'Unknown User';

  const getReportedUser = (reportedId: string) => users.find((u) => u.id === reportedId);

  return (
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
                        style={{
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          textDecoration: 'underline',
                        }}
                        onClick={() => {
                          const repUser = users.find((u) => u.id === report.reporterId);
                          if (repUser) onSelectUser(repUser);
                        }}
                      >
                        {getReporterName(report.reporterId)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                        onClick={() => reported && onSelectUser(reported)}
                      >
                        <img
                          src={reported?.photo || DEFAULT_AVATAR}
                          style={smallAvatarStyle}
                          alt=""
                        />
                        <div>
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: '0.85rem',
                              color: 'var(--primary)',
                              textDecoration: 'underline',
                            }}
                          >
                            {reported?.name}
                          </span>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.7rem',
                              color:
                                reported?.status === 'suspended' ? 'var(--danger)' : 'var(--success)',
                            }}
                          >
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
                    <td
                      style={{
                        ...tdStyle,
                        color: 'var(--muted)',
                        fontSize: '0.8rem',
                        maxWidth: '240px',
                        wordWrap: 'break-word',
                      }}
                    >
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
  );
};
