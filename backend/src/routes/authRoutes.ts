import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { Request, Response } from 'express';

interface JwtPayload {
  userId: string;
  role: string;
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
router.get('/check-admin', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // The role is already in the JWT token, no need to query the database
    const isAdmin = req.user.role === 'admin';
    
    return res.json({ 
      isAdmin,
      role: req.user.role 
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Error checking admin status' });
  }
});

router.get('/check-seller', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // The role is already in the JWT token, no need to query the database
    const isSeller = req.user.role === 'seller';
    
    return res.json({ 
      isSeller,
      role: req.user.role 
    });
  } catch (error) {
    console.error('Error checking seller status:', error);
    return res.status(500).json({ message: 'Error checking seller status' });
  }
});

export default router; 