import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchMatches, acceptRequest, declineRequest, setMatchesState } from '../store/slices/matchSlice';
import * as matchApi from '../api/matchApi';

export function useMatchRequests() {
  const dispatch = useAppDispatch();
  const { token, currentUser } = useAppSelector((state) => state.auth);
  const { matchRequests } = useAppSelector((state) => state.matches);

  const handleSendRequest = async (receiverId: string, message: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.sendMatchRequest(receiverId, message);
      dispatch(fetchMatches({ token, role: currentUser.role }));
      alert('Match request sent successfully!');
    } catch (err: any) {
      alert(err.message || 'Error sending request');
    }
  };

  const handleAcceptRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.updateMatchStatus(reqId, 'accepted');
      dispatch(acceptRequest(reqId));
      alert('Match request accepted!');
    } catch (err: any) {
      alert(err.message || 'Error accepting request');
    }
  };

  const handleDeclineRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.updateMatchStatus(reqId, 'declined');
      dispatch(declineRequest(reqId));
      alert('Match request declined.');
    } catch (err: any) {
      alert(err.message || 'Error declining request');
    }
  };

  const handleCancelRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.cancelMatchRequest(reqId);
      dispatch(setMatchesState(matchRequests.filter((r) => r.id !== reqId)));
      alert('Match request cancelled.');
    } catch (err: any) {
      alert(err.message || 'Error cancelling request');
    }
  };

  const handleUnfriend = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      await matchApi.cancelMatchRequest(reqId);
      dispatch(setMatchesState(matchRequests.filter((r) => r.id !== reqId)));
      alert('Roommate unfriended successfully.');
    } catch (err: any) {
      alert(err.message || 'Error unfriending');
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
