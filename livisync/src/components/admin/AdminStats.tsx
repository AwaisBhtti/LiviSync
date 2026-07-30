/** AdminStats — 4-card analytics row shown at the top of the Admin Panel. */
import type { User, Report, Hostel } from '../../types';
import { Building, Users, ShieldAlert } from 'lucide-react';
import { statCardStyle, statLabelStyle, statValueStyle } from '../../styles/commonStyles';

interface AdminStatsProps {
  users: User[];
  hostels: Hostel[];
  reports: Report[];
}

export const AdminStats = ({ users, hostels, reports }: AdminStatsProps) => {
  const pendingReportCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
      }}
    >
      <div className="card" style={statCardStyle}>
        <Users size={20} style={{ color: 'var(--muted)' }} />
        <div>
          <span style={statLabelStyle}>Total Students</span>
          <h2 style={statValueStyle}>{users.filter((u) => u.role === 'student').length}</h2>
        </div>
      </div>

      <div className="card" style={statCardStyle}>
        <Users size={20} style={{ color: 'var(--muted)' }} />
        <div>
          <span style={statLabelStyle}>Hostel Owners</span>
          <h2 style={statValueStyle}>{users.filter((u) => u.role === 'owner').length}</h2>
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
          <h2 style={statValueStyle}>{pendingReportCount}</h2>
        </div>
      </div>
    </div>
  );
};
