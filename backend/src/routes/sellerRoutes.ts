import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller
} from '../controllers/sellerController';
import User from '../models/User';
import { Order } from '../models/Order';

const router = express.Router();

// Public route to get all sellers (no authentication required)
router.get('/public', async (req, res) => {
  try {
    // Handle both old (role) and new (roles) structures
    const sellers = await User.find({
      $or: [
        { roles: { $in: ['seller'] } },
        { role: 'seller' }
      ]
    })
      .select('email roles role')
      .sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching public sellers:', error);
    res.status(500).json({ message: 'Error fetching sellers' });
  }
});

// Public route to get a single seller by ID (no authentication required)
router.get('/public/:id', async (req, res) => {
  try {
    // Handle both old (role) and new (roles) structures
    const seller = await User.findOne({
      _id: req.params.id,
      $or: [
        { roles: { $in: ['seller'] } },
        { role: 'seller' }
      ]
    })
      .select('email storeName phone isActive');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Error fetching public seller:', error);
    res.status(500).json({ message: 'Error fetching seller' });
  }
});

// Apply authentication middleware to all routes below
router.use(authenticateToken);

// Get all sellers
router.get('/', getAllSellers);

// Get seller's orders with pagination
router.get('/orders', async (req, res) => {
  try {
    // Check if user is authenticated and is a seller
    if (!req.user || !req.user.roles || !req.user.roles.includes('seller')) {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }

    const sellerId = req.user.userId;
    console.log('Fetching orders for seller:', sellerId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query: any = {
      'items.sellerId': sellerId
    };

    // Add filters if provided
    if (req.query.orderId) {
      query.orderId = { $regex: req.query.orderId, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    console.log('Total orders found:', totalOrders);

    // Get paginated orders
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Orders returned:', orders.length);

    res.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    if (!req.user || !req.user.roles || !req.user.roles.includes('seller')) {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }

    const { status } = req.body;
    const orderId = req.params.id;
    const sellerId = req.user.userId;

    // Find the order and verify it belongs to this seller
    const order = await Order.findOne({
      _id: orderId,
      'items.sellerId': sellerId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get seller by ID
router.get('/:id', getSellerById);

// Create new seller
router.post('/', createSeller);

// Update seller
router.put('/:id', updateSeller);

// Delete seller
router.delete('/:id', deleteSeller);

export default router; 