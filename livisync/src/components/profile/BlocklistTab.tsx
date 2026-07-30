import type { Student, User } from '../../types';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

interface BlocklistTabProps {
  currentUser: Student;
  users: User[];
  onUnblockUser: (targetId: string) => void;
}

export const BlocklistTab = ({ currentUser, users, onUnblockUser }: BlocklistTabProps) => {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Blocked Users</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Users you have blocked cannot send you roommate connection requests.
      </p>

      {currentUser.blockedUsers.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontStyle: 'italic', padding: '1rem 0' }}>
          You have not blocked any users.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentUser.blockedUsers.map((blockedId) => {
            const blockedUser = users.find((u) => u.id === blockedId);
            return (
              <div
                key={blockedId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={blockedUser?.photo || DEFAULT_AVATAR}
                    alt=""
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{blockedUser?.name || 'Unknown User'}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {blockedUser?.email || 'student'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => onUnblockUser(blockedId)}
                >
                  Unblock
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
