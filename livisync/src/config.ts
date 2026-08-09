const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = rawUrl.replace(/\/$/, '');
export const HOSTEL_PHOTO_LIMIT = 20;
