// API base URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to clean token format
const cleanToken = (token: string): string => {
  return token.replace('Bearer ', '');
};

// Helper function to get headers with authentication
const getHeaders = (token?: string, requireAuth: boolean = true) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requireAuth && token) {
    // Clean token and add Bearer prefix
    const cleanTokenValue = cleanToken(token);
    headers['Authorization'] = `Bearer ${cleanTokenValue}`;
  }

  return headers;
};

// Generic fetch wrapper with error handling
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string,
  requireAuth: boolean = true
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(token, requireAuth);

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
  get: (endpoint: string, token?: string, requireAuth: boolean = true) => 
    fetchApi(endpoint, { method: 'GET' }, token, requireAuth),

  post: (endpoint: string, data: any, token?: string, requireAuth: boolean = true) =>
    fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token, requireAuth),

  put: (endpoint: string, data: any, token?: string, requireAuth: boolean = true) =>
    fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token, requireAuth),

  delete: (endpoint: string, token?: string, requireAuth: boolean = true) =>
    fetchApi(endpoint, { method: 'DELETE' }, token, requireAuth),
}; 