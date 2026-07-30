import { apiRequest } from './apiClient';

export async function sendMatchRequest(receiverId: string, message: string) {
  return apiRequest('/students/matches', {
    method: 'POST',
    body: JSON.stringify({ receiver_id: receiverId, message }),
  });
}

export async function updateMatchStatus(reqId: string, status: 'accepted' | 'declined') {
  return apiRequest(`/students/matches/${reqId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function cancelMatchRequest(reqId: string) {
  return apiRequest(`/students/matches/${reqId}`, {
    method: 'DELETE',
  });
}
