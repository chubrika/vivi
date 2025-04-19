import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from './Category';

export interface IFilter extends Document {
  name: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  colors: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const filterSchema = new Schema<IFilter>(
  {
    name: {
      type: String,
      required: [true, 'Filter name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    colors: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
filterSchema.index({ name: 1 });
filterSchema.index({ category: 1 });
filterSchema.index({ isActive: 1 });

export default mongoose.model<IFilter>('Filter', filterSchema); 