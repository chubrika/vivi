import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { Cart } from '../models/Cart';

interface JwtPayload {
  userId: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.userId;
    
    // Find or create cart for the user
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        user: userId,
        items: []
      });
      await cart.save();
    }
    
    res.json({ items: cart.items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's cart
router.put('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.userId;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }
    
    // Find or create cart for the user
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        user: userId,
        items
      });
    } else {
      // Update existing cart
      cart.items = items;
    }
    
    await cart.save();
    
    res.json({ message: 'Cart updated successfully', items: cart.items });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear user's cart
router.delete('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.userId;
    
    // Find cart for the user
    const cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      // Clear items in the cart
      cart.items = [];
      await cart.save();
    }
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 