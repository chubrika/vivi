import mongoose, { Schema, Document } from 'mongoose';
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
  seller: mongoose.Types.ObjectId;
  category: ICategory['_id'];
  images: string[];
  isActive: boolean;
  productFeatureValues: IFeatureGroup[];
  filters: Array<IFilter['_id'] | { id: string; value: string }>;
  discountedPercent?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  discountedPrice?: number;
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
    ref: 'User',
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
    type: Schema.Types.Mixed,
    // Can be either ObjectId (for backward compatibility) or { id: string, value: string }
  }],
  discountedPercent: {
    type: Number,
    min: [0, 'Discount percent cannot be negative'],
    max: [100, 'Discount percent cannot exceed 100'],
    default: 0
  },
  discountStartDate: {
    type: Date
  },
  discountEndDate: {
    type: Date
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative']
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate discounted price
productSchema.pre('save', function(next) {
  // Calculate discounted price if discount percent is provided
  if (this.discountedPercent && this.discountedPercent > 0) {
    this.discountedPrice = this.price - (this.price * (this.discountedPercent / 100));
  } else {
    // If no discount, set discounted price to null or undefined
    this.discountedPrice = undefined;
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
productSchema.pre('findOneAndUpdate', function(this: any, next: any) {
  const update = this.getUpdate();
  
  // If price or discountedPercent is being updated, calculate new discounted price
  if (update.price !== undefined || update.discountedPercent !== undefined) {
    const currentDoc = this.getQuery();
    
    // Get the current document to access existing values
    this.model.findOne(currentDoc).then((doc: any) => {
      if (doc) {
        const newPrice = update.price !== undefined ? update.price : doc.price;
        const newDiscountPercent = update.discountedPercent !== undefined ? update.discountedPercent : doc.discountedPercent;
        
        if (newDiscountPercent && newDiscountPercent > 0) {
          update.discountedPrice = newPrice - (newPrice * (newDiscountPercent / 100));
        } else {
          update.discountedPrice = undefined;
        }
      }
      next();
    }).catch(next);
  } else {
    next();
  }
});

// Create indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ filters: 1 });

export default mongoose.model<IProduct>('Product', productSchema); 