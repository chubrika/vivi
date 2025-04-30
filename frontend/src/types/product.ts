export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  seller: {
    businessName: string;
    _id: string;
    name: string;
  };
  isActive: boolean;
  stock: number;
  productFeatureValues?: FeatureGroup[];
  filters?: {
    _id: string;
    name: string;
    description: string;
  }[];
  createdAt?: string;
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