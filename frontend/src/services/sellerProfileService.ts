import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface SellerProfileDocument {
  id: string;
  type: 'id' | 'company' | 'bank';
  url: string;
  uploadedAt: string;
}

export interface SellerProfile {
  _id: string;
  userId: string | {
    _id: string;
    email: string;
    roles?: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  storeName?: string;
  phone?: string;
  documents: SellerProfileDocument[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface UpdateSellerProfileData {
  storeName?: string;
  phone?: string;
  documents?: SellerProfileDocument[];
}

export interface SellerProfileWithUser extends SellerProfile {
  userId: {
    _id: string;
    email: string;
    roles?: string[];
    createdAt?: string;
  };
}

export const sellerProfileService = {
  // Get seller's own profile
  async getMyProfile(): Promise<SellerProfile> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch seller profile');
    }

    return data;
  },

  // Update seller's own profile (storeName, phone, documents) – all statuses can update
  async updateMyProfile(profileData: UpdateSellerProfileData): Promise<{ message: string; sellerProfile: SellerProfile }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update seller profile');
    }

    return data;
  },

  // Admin: Get all pending sellers
  async getPendingSellers(): Promise<SellerProfileWithUser[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch pending sellers');
    }

    return data;
  },

  // Admin: Get all sellers
  async getAllSellers(): Promise<SellerProfileWithUser[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch all sellers');
    }

    return data;
  },

  // Admin: Approve seller
  async approveSeller(sellerProfileId: string): Promise<{ message: string; sellerProfile: SellerProfile; user: any }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/${sellerProfileId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve seller');
    }

    return data;
  },

  // Admin: Reject seller
  async rejectSeller(sellerProfileId: string, reason?: string): Promise<{ message: string; sellerProfile: SellerProfile; user: any; reason?: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/${sellerProfileId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject seller');
    }

    return data;
  },

  // Admin: Suspend seller
  async suspendSeller(sellerProfileId: string, reason?: string): Promise<{ message: string; sellerProfile: SellerProfile; reason?: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/seller-profiles/${sellerProfileId}/suspend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to suspend seller');
    }

    return data;
  },
};
