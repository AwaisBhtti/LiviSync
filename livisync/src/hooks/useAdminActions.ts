/**
 * useAdminActions — encapsulates admin user management handlers.
 * Extracted from App.tsx.
 */
import { useAppDispatch, useAppSelector } from '../store/store';
import { toggleUserStatus, deleteUser, warnUser, resolveReport } from '../store/slices/adminSlice';
import { removeMatchesForUser } from '../store/slices/matchSlice';
import { showToast } from '../store/slices/toastSlice';

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
      dispatch(showToast({ message: err || 'Error occurred updating status.', type: 'error' }));
    }
  };

  const handleWarnUser = async (reportId: string) => {
    if (!token) return;
    try {
      await dispatch(warnUser({ reportId, token })).unwrap();
      dispatch(showToast({ message: 'Warning email sent successfully and report resolved.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error sending warning email.', type: 'error' }));
    }
  };

  const handleResolveReport = async (reportId: string) => {
    if (!token) return;
    try {
      await dispatch(resolveReport({ reportId, token })).unwrap();
      dispatch(showToast({ message: 'Report marked as resolved!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error resolving report.', type: 'error' }));
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
      dispatch(showToast({ message: 'User deleted successfully.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error deleting user.', type: 'error' }));
    }
  };

  return { handleToggleUserStatus, handleWarnUser, handleResolveReport, handleDeleteUser };
}
