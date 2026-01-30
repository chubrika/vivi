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
    const { email, roles, isActive } = req.body;
    
    // Find user first to check if we need to create courierProfile
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if courier role is being added
    const hasCourierRole = roles?.includes('courier') || roles?.some((r: string) => r === 'courier');
    const hadCourierRole = user.roles?.includes('courier') || (user as any).role === 'courier';
    
    // If courier role is being added and profile doesn't exist, create it
    if (hasCourierRole && !hadCourierRole && !user.courierProfile) {
      user.courierProfile = {
        totalEarnings: 0,
        pendingWithdrawal: false,
        deliveryHistory: [],
        payoutHistory: []
      };
    }

    // Update user fields
    if (email) user.email = email;
    if (roles) user.roles = roles;
    if (isActive !== undefined) (user as any).isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');
    return res.json(updatedUser);
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
// Note: isActive field was removed from User model as per new architecture
// If you need to deactivate users, consider using roles or a separate status field
router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // This endpoint is deprecated - isActive field no longer exists
    return res.status(400).json({ 
      message: 'This endpoint is no longer available. User model no longer has isActive field.' 
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all couriers
router.get('/couriers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Handle both old (role) and new (roles) structures
    const couriers = await User.find({
      $or: [
        { roles: { $in: ['courier'] } },
        { role: 'courier' }
      ]
    })
      .select('email roles role')
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
    // Handle both old (role) and new (roles) structures
    const courier = await User.findOne({
      _id: courierId,
      $or: [
        { roles: { $in: ['courier'] } },
        { role: 'courier' }
      ]
    });
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

// Remove courier assignment from order
router.delete('/orders/:orderId/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Remove courier assignment and set status back to pending
    order.courier = undefined;
    order.status = 'pending';
    await order.save();

    res.json({ message: 'Courier assignment removed successfully', order });
  } catch (error) {
    console.error('Error removing courier assignment:', error);
    res.status(500).json({ message: 'Error removing courier assignment' });
  }
});

// Get all orders with courier assignments
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email roles')
      .populate('courier', 'email roles')
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