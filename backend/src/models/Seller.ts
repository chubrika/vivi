import mongoose, { Schema, Document } from 'mongoose';

export interface ISeller extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
sellerSchema.index({ email: 1 });
sellerSchema.index({ name: 1 });
sellerSchema.index({ isActive: 1 });

export default mongoose.model<ISeller>('Seller', sellerSchema); 