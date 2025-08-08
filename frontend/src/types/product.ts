export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    name?: string;
    email: string;
  };
  category: string | {
    _id: string;
    name: string;
  };
  images: string[];
  isActive: boolean;
  productFeatureValues?: FeatureGroup[];
  filters?: {
    _id: string;
    name: string;
    description: string;
  }[];
  discountedPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountedPrice?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FeatureGroup {
  featureGroupId: number;
  featureGroupCaption: string;
  features: Feature[];
}

export interface Feature {
  featureId: number;
  featureCaption: string;
  featureValues: FeatureValue[];
}

export interface FeatureValue {
  type: number;
  featureValue: string;
} 