import { apiRequest } from './apiClient';

export async function fetchInvitations() {
  return apiRequest('/admin/invitations');
}

export async function revokeInvitation(token: string) {
  return apiRequest(`/admin/invitations/${token}/revoke`, {
    method: 'PUT',
  });
}

export async function generateInvite(email: string) {
  return apiRequest('/admin/invite', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
