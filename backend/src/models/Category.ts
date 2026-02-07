import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId;
  hasChildren: boolean;
  isActive: boolean;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    trim: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  hasChildren: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ hasChildren: 1 });

export default mongoose.model<ICategory>('Category', categorySchema); 