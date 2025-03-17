export * from './posts';
export * from './types';


const API_BASE = 'http://localhost:3000'; // Replace with env variable in production

/**
 * Base fetch utility for API calls.
 * @param endpoint - API endpoint path.
 * @param options - Fetch options (method, body, etc.).
 * @returns Promise with response data.
 * @throws Error on non-OK response.
 */
export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  console.log('apiClient: endpoint', endpoint, options);
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};
