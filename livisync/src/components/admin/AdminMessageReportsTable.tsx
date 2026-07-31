/** AdminMessageReportsTable — Message Reports section in the Admin Panel. */
import type { MessageReport, User } from '../../types';
import { MessageSquare, CheckCircle } from 'lucide-react';
import {
  sectionTitleStyle,
  tableContainerStyle,
  tableStyle,
  tableHeaderRowStyle,
  thStyle,
  tableRowStyle,
  tdStyle,
  tableBtnStyle,
} from '../../styles/commonStyles';

interface AdminMessageReportsTableProps {
  messageReports: MessageReport[];
  users: User[];
  onResolve: (reportId: string) => void;
}

const REASON_LABELS: Record<string, string> = {
  'harassment': 'Harassment',
  'hate-speech': 'Hate Speech',
  'threats': 'Threats',
  'spam': 'Spam',
  'inappropriate': 'Inappropriate',
  'other': 'Other',
};

export const AdminMessageReportsTable = ({
  messageReports,
  users,
  onResolve,
}: AdminMessageReportsTableProps) => {
  const pending = messageReports.filter((r) => r.status === 'pending');

  const getUserName = (id: string) =>
    users.find((u) => u.id === id)?.name || 'Unknown User';

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={sectionTitleStyle}>
        <MessageSquare size={18} /> Pending Message Reports ({pending.length})
      </h3>

      {pending.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
          No pending message reports.
        </p>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Reporter</th>
                <th style={thStyle}>Reported User</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Message Preview</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((report) => (
                <tr key={report.id} style={tableRowStyle}>
                  <td style={tdStyle}>{getUserName(report.reporterId)}</td>
                  <td style={tdStyle}>{getUserName(report.reportedUserId)}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: '220px' }}>
                    <span style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      fontStyle: 'italic',
                    }}>
                      "{report.messageText}"
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => onResolve(report.id)}
                      style={{ ...tableBtnStyle, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <CheckCircle size={13} /> Resolve
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
};
