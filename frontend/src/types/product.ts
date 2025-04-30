export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string | {
    _id: string;
    name: string;
  };
  seller: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    name?: string;
    email: string;
  };
  isActive: boolean;
  stock: number;
  productFeatureValues?: FeatureGroup[];
  filters?: {
    _id: string;
    name: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface FeatureGroup {
  _id: string;
  name: string;
  features: Feature[];
}

export interface Feature {
  _id: string;
  name: string;
  values: FeatureValue[];
}

export interface FeatureValue {
  _id: string;
  name: string;
  value: string;
} 