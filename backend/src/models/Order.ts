import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    images: {
      type: [String],
      default: []
    },
    sellerId: {
      type: String,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'balance', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate orderId before saving
orderSchema.pre('save', async function(next) {
  try {
    console.log('Pre-save middleware triggered');
    console.log('Current orderId:', this.orderId);
    
    // Always generate orderId if it doesn't exist
    if (!this.orderId) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.orderId = `ORD-${timestamp}-${random}`;
      console.log('Generated new orderId:', this.orderId);
    }
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error as Error);
  }
});

// Add a pre-validate middleware to ensure orderId is set
orderSchema.pre('validate', function(next) {
  next();
});

export const Order = mongoose.model('Order', orderSchema); 