import { apiRequest } from './apiClient';

export async function fetchChatHistory(activeChatUserId: string) {
  return apiRequest(`/chat/history/${activeChatUserId}`);
}

export async function markChatAsRead(activeChatUserId: string) {
  return apiRequest(`/chat/read/${activeChatUserId}`, {
    method: 'POST',
  });
}

export async function sendChatMessage(receiverId: string, text: string) {
  return apiRequest('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({
      receiver_id: receiverId,
      text,
    }),
  });
}
