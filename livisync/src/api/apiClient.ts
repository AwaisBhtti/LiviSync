import { API_BASE_URL } from '../config';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('livisync_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    let detail = `Request failed with status ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      if (Array.isArray(errorData.detail)) {
        detail = errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n');
      } else {
        detail = errorData.detail || detail;
      }
    } catch {
      if (errorText) detail = errorText;
    }
    throw new Error(detail);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
