// API base URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get headers with authentication
const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Generic fetch wrapper with error handling
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(token);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Common API methods
export const api = {
  get: (endpoint: string, token?: string) => 
    fetchApi(endpoint, { method: 'GET' }, token),

  post: (endpoint: string, data: any, token?: string) =>
    fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  put: (endpoint: string, data: any, token?: string) =>
    fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  delete: (endpoint: string, token?: string) =>
    fetchApi(endpoint, { method: 'DELETE' }, token),
}; 