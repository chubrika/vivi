import express from 'express';
import { authenticateToken, requireCourier } from '../middleware/auth';
import { Order } from '../models/Order';
import mongoose from 'mongoose';

const router = express.Router();

// Get all orders for courier
router.get('/orders', authenticateToken, requireCourier, async (req, res) => {
  try {
    const { page = 1, limit = 10, orderId, status, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = { 
      status: { $in: ['processing', 'shipped', 'delivered'] },
      courier: req.user?.userId // Add courier filter
    };
    
    console.log('Orders query:', JSON.stringify(query, null, 2));
    console.log('User ID:', req.user?.userId);

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
    console.log('Total orders found:', total);

    // Get paginated orders
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('courier', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log('Orders returned:', orders.length);

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

    // Find order and verify it belongs to this courier
    const order = await Order.findOne({ 
      _id: orderId,
      courier: req.user?.userId // Add courier filter
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
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

// Get courier statistics
router.get('/stats', authenticateToken, requireCourier, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Stats - User ID:', req.user?.userId);

    const stats = await Order.aggregate([
      {
        $match: {
          courier: new mongoose.Types.ObjectId(req.user?.userId) // Convert string ID to ObjectId
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          todayOrders: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', today] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          pendingOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1,
          todayOrders: 1
        }
      }
    ]);

    console.log('Stats result:', JSON.stringify(stats[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      todayOrders: 0
    }, null, 2));

    // Let's also check all orders for this courier to debug
    const allOrders = await Order.find({ courier: new mongoose.Types.ObjectId(req.user?.userId) });
    console.log('All orders for courier:', allOrders.length);
    console.log('Order statuses:', allOrders.map(o => o.status));

    res.json(stats[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      todayOrders: 0
    });
  } catch (error: any) {
    console.error('Error fetching courier stats:', error);
    res.status(500).json({ message: error.message || 'Error fetching statistics' });
  }
});

export default router; 