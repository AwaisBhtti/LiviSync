import { apiRequest } from './apiClient';
import { API_BASE_URL } from '../config';

export async function fetchOwnerPhone(hostelId: string) {
  return apiRequest(`/hostels/${hostelId}/view-phone`, {
    method: 'POST',
  });
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/owners/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}
