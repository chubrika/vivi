import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { Request, Response } from 'express';
import { requireSeller } from '../middleware/auth';

interface JwtPayload {
  userId: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
// Alias for /profile - some frontend code might use /users/me
router.get('/users/me', authenticateToken, getProfile);
router.get('/check-admin', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // The roles are already in the JWT token, no need to query the database
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    
    return res.json({ 
      isAdmin,
      roles: req.user.roles || []
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Error checking admin status' });
  }
});

router.get('/check-seller', authenticateToken, requireSeller, (req, res) => {
  res.json({ message: 'Seller access verified' });
});

router.get('/check-courier', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const isCourier = req.user.roles && req.user.roles.includes('courier');

    return res.json({
      isCourier,
      roles: req.user.roles || []
    });
  } catch (error) {
    console.error('Error checking courier status:', error);
    return res.status(500).json({ message: 'Error checking courier status' });
  }
});

// Update user profile
router.patch('/users/me', authenticateToken, updateProfile);

export default router; 