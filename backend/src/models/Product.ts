import mongoose, { Schema, Document } from 'mongoose';
import { ISeller } from './Seller';
import { ICategory } from './Category';
import { IFilter } from './Filter';

// Define interfaces for product features
export interface IFeatureValue {
  type: number;
  featureValue: string;
}

export interface IFeature {
  featureId: number;
  featureCaption: string;
  featureValues: IFeatureValue[];
}

export interface IFeatureGroup {
  featureGroupId: number;
  featureGroupCaption: string;
  features: IFeature[];
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: ISeller['_id'];
  category: ICategory['_id'];
  images: string[];
  isActive: boolean;
  productFeatureValues: IFeatureGroup[];
  filters: IFilter['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const featureValueSchema = new Schema({
  type: {
    type: Number,
    required: false,
    default: 1
  },
  featureValue: {
    type: String,
    required: true
  }
}, { _id: false });

const featureSchema = new Schema({
  featureId: {
    type: Number,
    required: true
  },
  featureCaption: {
    type: String,
    required: true
  },
  featureValues: [featureValueSchema]
}, { _id: false });

const featureGroupSchema = new Schema({
  featureGroupId: {
    type: Number,
    required: true
  },
  featureGroupCaption: {
    type: String,
    required: true
  },
  features: [featureSchema]
}, { _id: false });

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Product must belong to a seller']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to a category']
  },
  images: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  productFeatureValues: [featureGroupSchema],
  filters: [{
    type: Schema.Types.ObjectId,
    ref: 'Filter'
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ filters: 1 });

export default mongoose.model<IProduct>('Product', productSchema); 