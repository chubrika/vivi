import express from 'express';
import { auth, requireCourier, requireAdmin } from '../middleware/auth';
import { Order } from '../models/Order';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Get all orders for courier
router.get('/orders', auth, requireCourier, async (req, res) => {
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
router.patch('/orders/:id/status', auth, requireCourier, async (req, res) => {
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

    // Check if this is a new delivery completion
    const wasDelivered = order.status === 'delivered';
    const isNowDelivered = status === 'delivered';

    // Update order status
    order.status = status;
    await order.save();

    // If order is newly delivered, update courier earnings
    if (!wasDelivered && isNowDelivered) {
      const courier = await User.findById(req.user?.userId);
      if (courier) {
        // Check if this order is already in delivery history
        const isAlreadyCounted = courier.deliveryHistory?.includes(order._id);
        
                 if (!isAlreadyCounted) {
           // Add order to delivery history
           if (!courier.deliveryHistory) {
             courier.deliveryHistory = [];
           }
           courier.deliveryHistory.push(order._id);
           
           // Calculate earnings based on total deliveries
           const deliveryEarnings = 5; // ₾ per delivery
           const totalDeliveries = courier.deliveryHistory.length;
           courier.totalEarnings = totalDeliveries * deliveryEarnings;
           
           await courier.save();
           
           console.log(`Courier ${courier.email} earned ${deliveryEarnings} ₾ for delivery ${order.orderId}. Total earnings: ${courier.totalEarnings} ₾`);
         }
      }
    }

    res.json(order);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
});

// Get courier statistics
router.get('/stats', auth, requireCourier, async (req, res) => {
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

    // Get courier earnings info
    const courier = await User.findById(req.user?.userId);
    const deliveryEarnings = 5; // ₾ per delivery
    const totalDeliveries = courier?.deliveryHistory?.length || 0;
    const calculatedTotalEarnings = totalDeliveries * deliveryEarnings;
    
    const earningsInfo = {
      totalEarnings: calculatedTotalEarnings,
      pendingWithdrawal: courier?.pendingWithdrawal || false,
      totalDeliveries: totalDeliveries
    };

    res.json({
      ...(stats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        todayOrders: 0
      }),
      ...earningsInfo
    });
  } catch (error: any) {
    console.error('Error fetching courier stats:', error);
    res.status(500).json({ message: error.message || 'Error fetching statistics' });
  }
});

// Get courier earnings and delivery history
router.get('/earnings', auth, requireCourier, async (req, res) => {
  try {
    const courier = await User.findById(req.user?.userId);
    if (!courier) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    // Get delivery history with order details
    const deliveryHistory = await Order.find({
      _id: { $in: courier.deliveryHistory || [] }
    }).select('orderId totalAmount status createdAt');

    // Calculate earnings dynamically based on total deliveries
    const deliveryEarnings = 5; // ₾ per delivery
    const totalDeliveries = courier.deliveryHistory?.length || 0;
    const calculatedTotalEarnings = totalDeliveries * deliveryEarnings;

    res.json({
      totalEarnings: calculatedTotalEarnings,
      pendingWithdrawal: courier.pendingWithdrawal || false,
      payoutHistory: courier.payoutHistory || [],
      deliveryHistory: deliveryHistory,
      totalDeliveries: totalDeliveries
    });
  } catch (error: any) {
    console.error('Error fetching courier earnings:', error);
    res.status(500).json({ message: error.message || 'Error fetching earnings' });
  }
});

// Request withdrawal
router.post('/withdraw', auth, requireCourier, async (req, res) => {
  try {
    const courier = await User.findById(req.user?.userId);
    if (!courier) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    if (courier.pendingWithdrawal) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request' });
    }

    if (!courier.totalEarnings || courier.totalEarnings <= 0) {
      return res.status(400).json({ message: 'No earnings available for withdrawal' });
    }

    // Set pending withdrawal flag
    courier.pendingWithdrawal = true;
    await courier.save();

    res.json({ 
      message: 'Withdrawal request submitted successfully',
      pendingAmount: courier.totalEarnings
    });
  } catch (error: any) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({ message: error.message || 'Error requesting withdrawal' });
  }
});

// Get all couriers with pending withdrawals (admin only)
router.get('/pending-withdrawals', auth, requireAdmin, async (req, res) => {
  try {
    const couriers = await User.find({
      role: 'courier',
      pendingWithdrawal: true
    }).select('firstName lastName email totalEarnings pendingWithdrawal');

    res.json(couriers);
  } catch (error: any) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({ message: error.message || 'Error fetching pending withdrawals' });
  }
});

// Admin endpoint to process courier payouts
router.post('/payout/:courierId', auth, requireAdmin, async (req, res) => {
  try {

    const { status } = req.body; // 'paid' or 'rejected'
    const courierId = req.params.courierId;

    if (!['paid', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const courier = await User.findById(courierId);
    if (!courier || !courier.roles || !courier.roles.includes('courier')) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    if (!courier.pendingWithdrawal) {
      return res.status(400).json({ message: 'No pending withdrawal request' });
    }

    // Add to payout history
    const payoutRecord = {
      amount: courier.totalEarnings || 0,
      date: new Date(),
      status: status as 'paid' | 'rejected'
    };

    if (!courier.payoutHistory) {
      courier.payoutHistory = [];
    }
    courier.payoutHistory.push(payoutRecord);

    // Reset pending withdrawal and total earnings if paid
    if (status === 'paid') {
      courier.totalEarnings = 0;
    }
    courier.pendingWithdrawal = false;

    await courier.save();

    res.json({ 
      message: `Payout ${status} successfully`,
      payoutRecord
    });
  } catch (error: any) {
    console.error('Error processing payout:', error);
    res.status(500).json({ message: error.message || 'Error processing payout' });
  }
});

export default router; 