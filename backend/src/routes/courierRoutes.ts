import express from 'express';
import { authenticateToken, requireCourier } from '../middleware/auth';
import { Order } from '../models/Order';

const router = express.Router();

// Get all orders for courier
router.get('/orders', authenticateToken, requireCourier, async (req, res) => {
  try {
    const { page = 1, limit = 10, orderId, status, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = { status: { $in: ['processing', 'shipped', 'delivered'] } };
    
    if (orderId) {
      query.orderId = { $regex: orderId, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Get paginated orders
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching courier orders:', error);
    res.status(500).json({ message: error.message || 'Error fetching orders' });
  }
});

// Update order delivery status
router.patch('/orders/:id/status', authenticateToken, requireCourier, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.json(order);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
});

// Get courier stats
router.get('/stats', authenticateToken, requireCourier, async (req, res) => {
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date (start of day)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get total orders count
    const totalOrders = await Order.countDocuments({ 
      status: { $in: ['processing', 'shipped', 'delivered'] } 
    });
    
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ 
      status: 'processing' 
    });
    
    // Get delivered orders count
    const deliveredOrders = await Order.countDocuments({ 
      status: 'delivered' 
    });
    
    // Get today's orders count
    const todayOrders = await Order.countDocuments({ 
      status: { $in: ['processing', 'shipped', 'delivered'] },
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    res.json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      todayOrders
    });
  } catch (error: any) {
    console.error('Error fetching courier stats:', error);
    res.status(500).json({ message: error.message || 'Error fetching courier stats' });
  }
});

export default router; 