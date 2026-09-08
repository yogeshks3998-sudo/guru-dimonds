const DEFAULT_API_URL = import.meta.env?.PROD ? '/api' : 'http://localhost:5000/api';
export const AUTH_TOKEN_KEY = 'guru_diamonds_auth_token_v1';
export const LEGACY_AUTH_TOKEN_KEY = 'vedaara_auth_token_v1';

export const API_BASE_URL = import.meta.env?.VITE_API_URL || DEFAULT_API_URL;

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    localStorage.removeItem('guru_mock_user_v1');
  } catch {
    // Ignore storage errors
  }
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const legacyToken = localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
  if (legacyToken && !localStorage.getItem(AUTH_TOKEN_KEY)) {
    localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
  }
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }
    let message = `API request failed with ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // Keep the status-based message when the response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function jsonRequest<T>(path: string, method: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method,
    body: JSON.stringify(body),
  });
}
