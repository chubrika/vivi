import mongoose, { Schema, Document } from 'mongoose';
import { ISeller } from './Seller';
import { ICategory } from './Category';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: ISeller['_id'];
  category: ICategory['_id'];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });

export default mongoose.model<IProduct>('Product', productSchema); 