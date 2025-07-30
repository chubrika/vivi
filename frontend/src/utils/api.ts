// API base URL from environment variables
// For production, use the same domain as the frontend but with /api path
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If running in production (on vivi.ge domain), use the same domain for API
  if (typeof window !== 'undefined' && window.location.hostname === 'www.vivi.ge') {
    return 'https://www.vivi.ge';
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

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