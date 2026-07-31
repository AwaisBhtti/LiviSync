import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchMatches, acceptRequest, declineRequest, setMatchesState } from '../store/slices/matchSlice';
import { showToast } from '../store/slices/toastSlice';
import * as matchApi from '../api/matchApi';

export function useMatchRequests() {
  const dispatch = useAppDispatch();
  const { token, currentUser } = useAppSelector((state) => state.auth);
  const { matchRequests } = useAppSelector((state) => state.matches);

  const isProfileIncomplete = (user: any) => {
    if (!user || user.role !== 'student') return false;
    return !(user.isProfileComplete || user.is_profile_complete);
  };

  const handleSendRequest = async (receiverId: string, message: string) => {
    if (!currentUser || !token) return;
    if (isProfileIncomplete(currentUser)) {
      dispatch(showToast({ message: 'You must complete your profile and lifestyle preferences in order to connect with roommates.', type: 'error' }));
      return;
    }
    try {
      await matchApi.sendMatchRequest(receiverId, message);
      dispatch(fetchMatches({ token, role: currentUser.role }));
      dispatch(showToast({ message: 'Match request sent successfully!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error sending request', type: 'error' }));
    }
  };

  const handleAcceptRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    if (isProfileIncomplete(currentUser)) {
      dispatch(showToast({ message: 'You must complete your profile and lifestyle preferences in order to connect with roommates.', type: 'error' }));
      return;
    }
    try {
      await matchApi.updateMatchStatus(reqId, 'accepted');
      dispatch(acceptRequest(reqId));
      dispatch(showToast({ message: 'Match request accepted!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error accepting request', type: 'error' }));
    }
  };

  const handleDeclineRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.updateMatchStatus(reqId, 'declined');
      dispatch(declineRequest(reqId));
      dispatch(showToast({ message: 'Match request declined.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error declining request', type: 'error' }));
    }
  };

  const handleCancelRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.cancelMatchRequest(reqId);
      dispatch(setMatchesState(matchRequests.filter((r) => r.id !== reqId)));
      dispatch(showToast({ message: 'Match request cancelled.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error cancelling request', type: 'error' }));
    }
  };

  const handleUnfriend = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.cancelMatchRequest(reqId);
      dispatch(setMatchesState(matchRequests.filter((r) => r.id !== reqId)));
      dispatch(showToast({ message: 'Roommate unfriended successfully.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error unfriending', type: 'error' }));
    }
  };

  return {
    handleSendRequest,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelRequest,
    handleUnfriend,
  };
}
