import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { login, register } from '../controllers/authController';

const router = express.Router();

// Check admin access
router.get('/check-admin', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ isAdmin: user.role === 'admin' });
  } catch (error) {
    console.error('Error checking admin access:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', login);

// Register route
router.post('/register', register);

export default router; 