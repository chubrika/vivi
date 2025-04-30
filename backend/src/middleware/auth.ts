import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

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

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Verify token with explicit error handling
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      
      // Validate decoded token has required fields
      if (!decoded.userId || !decoded.role) {
        console.error('Invalid token payload:', decoded);
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this route' });
    }

    next();
  };
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this route' });
    }

    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const requireCourier = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'courier') {
    return res.status(403).json({ message: 'Access denied. Courier role required.' });
  }
  next();
};

export const requireSeller = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'seller') {
    return res.status(403).json({ message: 'Access denied. Seller role required.' });
  }
  next();
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Verify token with explicit error handling
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      
      // Validate decoded token has required fields
      if (!decoded.userId || !decoded.role) {
        console.error('Invalid token payload:', decoded);
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 