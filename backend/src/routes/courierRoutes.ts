import express from 'express';
import { authenticateToken, requireCourier } from '../middleware/auth';
import { Order } from '../models/Order';

const router = express.Router();

// Get courier's assigned orders
router.get('/orders', authenticateToken, requireCourier, async (req, res) => {
  try {
    const orders = await Order.find({ courier: req.user?.userId })
      .populate('user', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching courier orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status (for courier)
router.patch('/orders/:orderId/status', authenticateToken, requireCourier, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find and update the order
    const order = await Order.findOne({
      _id: orderId,
      courier: req.user?.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get courier stats
router.get('/stats', authenticateToken, requireCourier, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, pendingOrders, deliveredOrders, todayOrders] = await Promise.all([
      Order.countDocuments({ courier: req.user?.userId }),
      Order.countDocuments({ courier: req.user?.userId, status: 'processing' }),
      Order.countDocuments({ courier: req.user?.userId, status: 'delivered' }),
      Order.countDocuments({
        courier: req.user?.userId,
        createdAt: { $gte: today }
      })
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      todayOrders
    });
  } catch (error) {
    console.error('Error fetching courier stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default router; 