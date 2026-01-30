import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface ICourierProfile {
  totalEarnings: number;
  pendingWithdrawal: boolean;
  deliveryHistory: mongoose.Types.ObjectId[];
  payoutHistory: Array<{
    amount: number;
    date: Date;
    status: 'paid' | 'rejected';
  }>;
}

interface IUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  personalNumber?: string;
  balance?: number; // Wallet balance for role 'user' (pay with balance at checkout)
  roles?: string[]; // Array of roles: ['user'], ['user', 'seller'], ['admin'], etc.
  role?: string; // Legacy field for backward compatibility
  courierProfile?: ICourierProfile;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getRoles(): string[]; // Helper method to normalize roles
}

// Courier Profile Schema
const courierProfileSchema = new mongoose.Schema<ICourierProfile>({
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingWithdrawal: {
    type: Boolean,
    default: false
  },
  deliveryHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
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
      required: true
    }
  }]
}, {
  _id: false // No separate _id for subdocument
});

const userSchema = new mongoose.Schema<IUser>({
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
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  personalNumber: { type: String, trim: true },
  balance: {
    type: Number,
    default: 0,
  },
  roles: {
    type: [String],
    default: ['user'],
    validate: {
      validator: function(roles: string[]) {
        const validRoles = ['user', 'admin', 'seller', 'courier'];
        return roles.every(role => validRoles.includes(role));
      },
      message: 'Invalid role in roles array'
    }
  },
  role: {
    type: String,
    required: false, // Legacy field for backward compatibility
    enum: ['user', 'admin', 'seller', 'courier']
  },
  courierProfile: {
    type: courierProfileSchema,
    required: false
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Normalize role values before validation (convert 'customer' to 'user' for backward compatibility)
userSchema.pre('save', function(next) {
  // Normalize legacy role field: 'customer' -> 'user'
  if ((this as any).role === 'customer') {
    (this as any).role = 'user';
  }
  
  // Normalize roles array: convert 'customer' to 'user'
  if (this.roles && Array.isArray(this.roles)) {
    this.roles = this.roles.map(role => role === 'customer' ? 'user' : role);
  }
  
  // Initialize courierProfile if user has courier role and profile doesn't exist
  const hasCourierRole = this.roles?.includes('courier') || (this as any).role === 'courier';
  if (hasCourierRole && !this.courierProfile) {
    this.courierProfile = {
      totalEarnings: 0,
      pendingWithdrawal: false,
      deliveryHistory: [],
      payoutHistory: []
    };
  }
  
  next();
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

// Helper method to normalize roles - handles both old (role) and new (roles) structures
userSchema.methods.getRoles = function(): string[] {
  // If roles array exists and is not empty, use it
  if (this.roles && Array.isArray(this.roles) && this.roles.length > 0) {
    return this.roles;
  }
  
  // If old role field exists, convert it to array
  if (this.role && typeof this.role === 'string') {
    return [this.role];
  }
  
  // Default to ['user']
  return ['user'];
};

const User = mongoose.model<IUser>('User', userSchema);

export default User; 