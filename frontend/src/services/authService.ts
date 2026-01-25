import { API_BASE_URL } from '../utils/api';
import type { SellerProfileInfo, User, UserRole } from '../types/user';

interface AuthCredentials {
  email: string;
  password: string;
  roles: UserRole[];
  phone?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  sellerProfile?: SellerProfileInfo;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Normalize user.roles (backend may still send role)
    if (data.user && !data.user.roles && (data.user as any).role) {
      data.user = { ...data.user, roles: [(data.user as any).role] };
    }
    if (data.user && !Array.isArray(data.user.roles)) {
      data.user = { ...data.user, roles: data.user.roles || ['user'] };
    }
    return data;
  },

  async register(credentials: AuthCredentials): Promise<AuthResponse> {
    // Map frontend role to backend userType
    // 'customer' -> 'user', 'seller' -> 'seller'
    const userType = credentials.roles?.[0] === 'seller' ? 'seller' : 'user';
    
    // Prepare the request body with userType instead of role
    const requestBody: any = {
      email: credentials.email,
      password: credentials.password,
      userType: userType,
    };
    
    // Add optional fields if they exist
    if (credentials.firstName) requestBody.firstName = credentials.firstName;
    if (credentials.lastName) requestBody.lastName = credentials.lastName;
    if (credentials.phoneNumber) requestBody.phoneNumber = credentials.phoneNumber;
    if (credentials.sellerProfile?.storeName) requestBody.storeName = credentials.sellerProfile.storeName;
    if (credentials.sellerProfile?.phone) requestBody.phone = credentials.sellerProfile.phone;

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Normalize user.roles (backend may still send role)
    if (data.user && !data.user.roles && (data.user as any).role) {
      data.user = { ...data.user, roles: [(data.user as any).role] };
    }
    if (data.user && !Array.isArray(data.user.roles)) {
      data.user = { ...data.user, roles: data.user.roles || ['user'] };
    }
    return data;
  },
}; 