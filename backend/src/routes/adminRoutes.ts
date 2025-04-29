import express from 'express';
import { getStats } from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import User from '../models/User';
import { Order } from '../models/Order';

const router = express.Router();

// Admin stats route - protected with authentication and admin check
router.get('/stats', authenticateToken, requireAdmin, getStats);

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all couriers
router.get('/couriers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const couriers = await User.find({ role: 'courier' })
      .select('firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json(couriers);
  } catch (error) {
    console.error('Error fetching couriers:', error);
    res.status(500).json({ message: 'Error fetching couriers' });
  }
});

// Assign order to courier
router.post('/orders/:orderId/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { courierId } = req.body;

    // Validate courier exists and is actually a courier
    const courier = await User.findOne({ _id: courierId, role: 'courier' });
    if (!courier) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order with courier and set status to processing
    order.courier = courierId;
    order.status = 'processing';
    await order.save();

    res.json({ message: 'Order assigned successfully', order });
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({ message: 'Error assigning order' });
  }
});

// Get all orders with courier assignments
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('courier', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status (admin only)
router.patch('/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
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

export default router; 