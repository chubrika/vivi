export type UserRole = 'user' | 'seller' | 'courier' | 'admin';

export interface User {
  _id: string;

  // Auth
  email: string;
  password?: string; // optional; never in API responses
  roles: UserRole[];

  // Basic identity (optional)
  firstName?: string;
  lastName?: string;
  phone?: string;

  // Status
  isEmailVerified?: boolean;
  isActive?: boolean;

  // Metadata
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Optional fields from profile/API
  phoneNumber?: string;
  address?: string;
  balance?: number;
  personalNumber?: string;
  sellerProfile?: SellerProfileInfo;
}

export interface SellerProfileInfo {
  _id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  storeName?: string;
  phone?: string;
  documents?: Array<{
    id: string;
    type: 'id' | 'company' | 'bank';
    url: string;
    uploadedAt: string;
  }>;
  approvedAt?: string;
}
