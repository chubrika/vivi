import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'customer' | 'seller' | 'courier';
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
  personalNumber?: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  // Courier-specific fields
  deliveryHistory?: mongoose.Types.ObjectId[];
  totalEarnings?: number;
  pendingWithdrawal?: boolean;
  payoutHistory?: Array<{
    amount: number;
    date: Date;
    status: 'paid' | 'rejected';
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'customer', 'seller', 'courier'],
    default: 'user',
  },
  businessName: {
    type: String,
    trim: true,
  },
  businessAddress: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  personalNumber: {
    type: String,
    trim: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Courier-specific fields
  deliveryHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: []
  }],
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingWithdrawal: {
    type: Boolean,
    default: false
  },
  payoutHistory: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['paid', 'rejected'],
      default: 'paid'
    }
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User; 