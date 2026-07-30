import { apiRequest } from './apiClient';

export async function blockUser(targetId: string) {
  return apiRequest('/students/blocks', {
    method: 'POST',
    body: JSON.stringify({ blocked_user_id: targetId }),
  });
}

export async function unblockUser(targetId: string) {
  return apiRequest(`/students/blocks/${targetId}`, {
    method: 'DELETE',
  });
}

export async function reportUser(reportedId: string, reason: string, description: string) {
  return apiRequest('/students/reports', {
    method: 'POST',
    body: JSON.stringify({
      reported_id: reportedId,
      reason,
      description,
    }),
  });
}
