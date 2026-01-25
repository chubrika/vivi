import mongoose, { Schema, Document } from 'mongoose';

export interface ISellerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  storeName?: string;
  phone?: string;
  documents: Array<{
    id: string;
    type: 'id' | 'company' | 'bank';
    url: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  approvedAt?: Date;
}

const sellerProfileSchema = new Schema<ISellerProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
    required: true
  },
  storeName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  documents: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['id', 'company', 'bank'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes
sellerProfileSchema.index({ userId: 1 });
sellerProfileSchema.index({ status: 1 });

const SellerProfile = mongoose.model<ISellerProfile>('SellerProfile', sellerProfileSchema);

export default SellerProfile;
