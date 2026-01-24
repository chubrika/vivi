import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import SellerProfile from '../models/SellerProfile';

interface JwtPayload {
  userId: string;
  roles: string[]; // Changed from role to roles array
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// requireAuth - ensures user is authenticated
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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
      if (!decoded.userId || !decoded.roles || !Array.isArray(decoded.roles)) {
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

// Alias for backward compatibility
export const protect = requireAuth;

// requireRole - checks if user has at least one of the required roles
export const requireRole = (...requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        message: `Access denied. Required role(s): ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Alias for backward compatibility
export const authorize = requireRole;

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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
      
      // Validate decoded token has required fields
      if (!decoded.userId || !decoded.roles || !Array.isArray(decoded.roles)) {
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

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized to access this route' });
    }

    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const requireCourier = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.roles || !req.user.roles.includes('courier')) {
    return res.status(403).json({ message: 'Access denied. Courier role required.' });
  }
  next();
};

export const requireSeller = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.roles || !req.user.roles.includes('seller')) {
    return res.status(403).json({ message: 'Access denied. Seller role required.' });
  }
  next();
};

// requireApprovedSeller - checks if user has seller role AND approved status
export const requireApprovedSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // Check if user has seller role
    if (!req.user.roles || !req.user.roles.includes('seller')) {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }

    // Check if seller profile exists and is approved
    const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });
    
    if (!sellerProfile) {
      return res.status(403).json({ message: 'Seller profile not found.' });
    }

    if (sellerProfile.status !== 'approved') {
      return res.status(403).json({ 
        message: `Access denied. Seller status is ${sellerProfile.status}. Only approved sellers can perform this action.` 
      });
    }

    next();
  } catch (error) {
    console.error('Require Approved Seller Middleware Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
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
      if (!decoded.userId || !decoded.roles || !Array.isArray(decoded.roles)) {
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