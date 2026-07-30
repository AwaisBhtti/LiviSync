import type { Student, User, MatchRequest } from '../../types';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

interface FriendsTabProps {
  currentUser: Student;
  users: User[];
  matchRequests: MatchRequest[];
  onUnfriend: (requestId: string) => void;
}

export const FriendsTab = ({ currentUser, users, matchRequests, onUnfriend }: FriendsTabProps) => {
  // Filter matched friends
  const matchedFriendIds = matchRequests
    .filter((r) => r.status === 'accepted')
    .map((r) => (r.senderId === currentUser.id ? r.receiverId : r.senderId));
  const friends = users.filter((u) => matchedFriendIds.includes(u.id));

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>My Friends</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        These are roommates you have matched with successfully.
      </p>

      {friends.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontStyle: 'italic', padding: '1rem 0' }}>
          You haven't matched with any roommates yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {friends.map((friend) => {
            const req = matchRequests.find(
              (r) =>
                r.status === 'accepted' &&
                ((r.senderId === currentUser.id && r.receiverId === friend.id) ||
                  (r.senderId === friend.id && r.receiverId === currentUser.id))
            );
            return (
              <div
                key={friend.id}
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
                    src={friend.photo || DEFAULT_AVATAR}
                    alt=""
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{friend.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>
                      {friend.email} • {friend.phone || 'No phone added'}
                    </span>
                  </div>
                </div>
                {req && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => onUnfriend(req.id)}
                  >
                    Unfriend
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
