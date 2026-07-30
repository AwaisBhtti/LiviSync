/**
 * useAdminActions — encapsulates admin user management handlers.
 * Extracted from App.tsx.
 */
import { useAppDispatch, useAppSelector } from '../store/store';
import { toggleUserStatus, deleteUser, warnUser, resolveReport } from '../store/slices/adminSlice';
import { removeMatchesForUser } from '../store/slices/matchSlice';

export function useAdminActions() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { users: adminUsers } = useAppSelector((state) => state.admin);

  const handleToggleUserStatus = async (userId: string) => {
    if (!token) return;
    const user = adminUsers.find((u) => u.id === userId);
    if (!user) return;
    try {
      await dispatch(
        toggleUserStatus({
          userId,
          token,
          currentStatus: user.status ?? 'active',
          role: user.role as 'student' | 'owner',
        })
      ).unwrap();
    } catch (err: any) {
      alert(err || 'Error occurred updating status.');
    }
  };

  const handleWarnUser = async (reportId: string) => {
    if (!token) return;
    try {
      await dispatch(warnUser({ reportId, token })).unwrap();
      alert('Warning email sent successfully and report resolved.');
    } catch (err: any) {
      alert(err || 'Error sending warning email.');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    if (!token) return;
    try {
      await dispatch(resolveReport({ reportId, token })).unwrap();
      alert('Report marked as resolved!');
    } catch (err: any) {
      alert(err || 'Error resolving report.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    const user = adminUsers.find((u) => u.id === userId);
    if (!user) return;
    try {
      await dispatch(
        deleteUser({ userId, token, role: user.role as 'student' | 'owner' })
      ).unwrap();
      dispatch(removeMatchesForUser(userId));
      alert('User deleted successfully.');
    } catch (err: any) {
      alert(err || 'Error deleting user.');
    }
  };

  return { handleToggleUserStatus, handleWarnUser, handleResolveReport, handleDeleteUser };
}
