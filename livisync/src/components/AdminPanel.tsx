/**
 * AdminPanel — orchestrates all admin sub-sections.
 * Business logic is delegated to child components; layout is kept here.
 */
import { useState } from 'react';
import type { User, Report, MessageReport, Hostel } from '../types';
import { pageHeaderStyle, modalOverlayStyle, modalContentStyle, DEFAULT_AVATAR } from '../styles/commonStyles';
import { AdminStats } from './admin/AdminStats';
import { AdminReportsTable } from './admin/AdminReportsTable';
import { AdminMessageReportsTable } from './admin/AdminMessageReportsTable';
import { AdminUsersTable } from './admin/AdminUsersTable';
import { AdminInviteSection } from './admin/AdminInviteSection';
import { AdminHostelVerification } from './admin/AdminHostelVerification';

interface AdminPanelProps {
  users: User[];
  reports: Report[];
  messageReports: MessageReport[];
  hostels: Hostel[];
  onToggleUserStatus: (userId: string) => void;
  onResolveReport: (reportId: string) => void;
  onWarnUser: (reportId: string) => void;
  onDeleteUser: (userId: string) => void;
  onVerifyHostel: (hostelId: string) => void;
  onResolveMessageReport: (reportId: string) => void;
  onUpdateNearbyLocations: (hostelId: string, locations: string[]) => void;
}

export const AdminPanel = ({
  users,
  reports,
  messageReports,
  hostels,
  onToggleUserStatus,
  onResolveReport,
  onWarnUser,
  onDeleteUser,
  onVerifyHostel,
  onResolveMessageReport,
  onUpdateNearbyLocations,
}: AdminPanelProps) => {
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={pageHeaderStyle}>
        <h1>Admin Control Panel</h1>
        <p style={{ color: 'var(--muted)' }}>
          Manage student safety, view usage analytics, and moderate reports.
        </p>
      </div>

      {/* Analytics */}
      <AdminStats users={users} hostels={hostels} reports={reports} />

      {/* Pending Safety Reports */}
      <AdminReportsTable
        reports={reports}
        users={users}
        onResolveReport={onResolveReport}
        onWarnUser={onWarnUser}
        onToggleUserStatus={onToggleUserStatus}
        onSelectUser={setSelectedUserDetail}
      />

      {/* Message Reports */}
      <AdminMessageReportsTable
        messageReports={messageReports}
        users={users}
        onResolve={onResolveMessageReport}
      />

      {/* Student & Owner Directories */}
      <AdminUsersTable
        users={users}
        onToggleUserStatus={onToggleUserStatus}
        onDeleteUser={onDeleteUser}
      />

      {/* Invite Owners */}
      <AdminInviteSection />

      {/* Hostel Verification */}
      <AdminHostelVerification
        hostels={hostels}
        onVerifyHostel={onVerifyHostel}
        onUpdateNearbyLocations={onUpdateNearbyLocations}
      />

      {/* Student Profile Details Modal */}
      {selectedUserDetail && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Student Profile Details</h3>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  fontSize: '1.25rem',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={selectedUserDetail.photo || DEFAULT_AVATAR}
                  alt=""
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)',
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selectedUserDetail.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {selectedUserDetail.age} y/o • {selectedUserDetail.gender}
                  </span>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>
                  Contact Information
                </h5>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>📧 Email: {selectedUserDetail.email}</p>
                {selectedUserDetail.phone && (
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>📞 Phone: {selectedUserDetail.phone}</p>
                )}
              </div>

              {selectedUserDetail.bio && (
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>
                    Biography
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--muted)' }}>
                    {selectedUserDetail.bio}
                  </p>
                </div>
              )}

              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>
                  Living &amp; Study Details
                </h5>
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
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--muted)' }}>
                    Lifestyle Habits
                  </h5>
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
    </div>
  );
};
