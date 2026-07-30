/**
 * useUserActions — encapsulates block, unblock, and report handlers.
 * Extracted from App.tsx.
 */
import type { Student } from '../types';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setBlockedUsers } from '../store/slices/authSlice';
import { updateUserInList } from '../store/slices/roommateSlice';
import { removeMatchesForUser } from '../store/slices/matchSlice';
import { addLocalReport } from '../store/slices/adminSlice';
import { showToast } from '../store/slices/toastSlice';
import type { Report } from '../types';
import * as userApi from '../api/userApi';

export function useUserActions() {
  const dispatch = useAppDispatch();
  const { token, currentUser } = useAppSelector((state) => state.auth);

  const handleBlockUser = async (targetId: string) => {
    if (!currentUser || currentUser.role !== 'student' || !token) return;
    try {
      await userApi.blockUser(targetId);

      const student = currentUser as Student;
      const updatedBlocked = student.blockedUsers.includes(targetId)
        ? student.blockedUsers
        : [...student.blockedUsers, targetId];

      dispatch(setBlockedUsers(updatedBlocked));
      const updatedUser = { ...currentUser, blockedUsers: updatedBlocked };
      dispatch(updateUserInList(updatedUser));
      dispatch(removeMatchesForUser(targetId));
      dispatch(showToast({ message: 'User blocked successfully.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error blocking user', type: 'error' }));
    }
  };

  const handleUnblockUser = async (targetId: string) => {
    if (!currentUser || currentUser.role !== 'student' || !token) return;
    try {
      await userApi.unblockUser(targetId);

      const student = currentUser as Student;
      const updatedBlocked = student.blockedUsers.filter((id) => id !== targetId);

      dispatch(setBlockedUsers(updatedBlocked));
      const updatedUser = { ...currentUser, blockedUsers: updatedBlocked };
      dispatch(updateUserInList(updatedUser));
      dispatch(showToast({ message: 'User unblocked successfully.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error unblocking user', type: 'error' }));
    }
  };

  const handleReportUser = async (reportedId: string, reason: string, description: string) => {
    if (!currentUser || !token) return;
    try {
      await userApi.reportUser(reportedId, reason, description);

      const newReport: Report = {
        id: `rep_${Date.now()}`,
        reporterId: currentUser.id,
        reportedId,
        reason: reason as Report['reason'],
        description,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      dispatch(addLocalReport(newReport));

      const confirmBlock = window.confirm(
        'Thank you. The safety report has been filed and sent to administrators for review.\n\n' +
          'Would you like to block this user as well to prevent them from contacting or matching with you?'
      );
      if (confirmBlock) {
        await handleBlockUser(reportedId);
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error submitting safety report', type: 'error' }));
    }
  };

  return { handleBlockUser, handleUnblockUser, handleReportUser };
}
