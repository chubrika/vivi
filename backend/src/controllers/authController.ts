import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import SellerProfile from '../models/SellerProfile';
const { JWT_SECRET } = require('../config');

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, userType } = req.body; // userType: 'user' | 'seller'

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (userType && !['user', 'seller'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid userType. Must be "user" or "seller"' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with roles: ['user']
    const user = new User({
      email,
      password,
      roles: ['user'] // All users start with 'user' role
    });

    await user.save();

    // If seller is selected, create SellerProfile with pending status
    let sellerProfile = null;
    if (userType === 'seller') {
      sellerProfile = new SellerProfile({
        userId: user._id,
        status: 'pending'
      });
      await sellerProfile.save();
    }

    // Get JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Normalize roles for new registrations (should already be ['user'], but ensure consistency)
      const normalizedRoles = user.roles && Array.isArray(user.roles) && user.roles.length > 0 
        ? user.roles 
        : ['user'];
      
      // Generate JWT token with roles array
      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          roles: normalizedRoles
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('Registration successful for user:', email);
      
      // Return user data and token
      res.status(201).json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          roles: normalizedRoles,
          balance: user.balance ?? 0
        },
        ...(sellerProfile && {
          sellerProfile: {
            _id: sellerProfile._id,
            status: sellerProfile.status
          }
        })
      });
    } catch (jwtError) {
      console.error('JWT Signing Error:', jwtError);
      return res.status(500).json({ message: 'Error creating authentication token' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Check if user exists and select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', { id: user._id, email: user.email, roles: user.roles });

    // Check password using the user's comparePassword method
    const isValidPassword = await user.comparePassword(password);
    console.log('Password validation result:', isValidPassword);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Normalize roles - handle both old (role) and new (roles) structures
    let normalizedRoles: string[];
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // New structure: roles array exists
      // Normalize 'customer' to 'user' in roles array
      normalizedRoles = user.roles.map(role => role === 'customer' ? 'user' : role);
    } else if ((user as any).role && typeof (user as any).role === 'string') {
      // Old structure: convert role string to roles array
      // Normalize 'customer' to 'user'
      const roleValue = (user as any).role === 'customer' ? 'user' : (user as any).role;
      normalizedRoles = [roleValue];
      // Migrate: update user to new structure
      user.roles = normalizedRoles;
      // Remove old role field if it exists
      if ((user as any).role) {
        (user as any).role = undefined;
      }
      await user.save();
      console.log('Migrated user from old role structure to new roles array:', email);
    } else {
      // Default fallback
      normalizedRoles = ['user'];
      user.roles = normalizedRoles;
      await user.save();
    }

    console.log('User roles after normalization:', normalizedRoles);

    // Get JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Create token with normalized roles array
      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          roles: normalizedRoles
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('Login successful for user:', email);
      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          roles: normalizedRoles,
          balance: user.balance ?? 0
        },
      });
    } catch (jwtError) {
      console.error('JWT Signing Error:', jwtError);
      return res.status(500).json({ message: 'Error creating authentication token' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Normalize roles - handle both old and new structures
    const normalizedRoles = user.roles && Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles
      : ((user as any).role ? [(user as any).role] : ['user']);

    // Get seller profile if user has seller role (check both old and new role structures)
    let sellerProfile = null;
    try {
      if (normalizedRoles.includes('seller')) {
        sellerProfile = await SellerProfile.findOne({ userId: user._id });
      }
    } catch (sellerProfileError) {
      console.error('Error fetching seller profile:', sellerProfileError);
      // Continue without seller profile if there's an error
    }

    // Return user data with all optional fields safely accessed
    const userData: any = {
      id: user._id,
      email: user.email,
      roles: normalizedRoles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Add optional fields if they exist (for backward compatibility)
      firstName: (user as any).firstName || undefined,
      lastName: (user as any).lastName || undefined,
      phoneNumber: (user as any).phoneNumber || undefined,
      personalNumber: (user as any).personalNumber || undefined,
      balance: user.balance ?? 0,
      businessName: (user as any).businessName || undefined,
      businessAddress: (user as any).businessAddress || undefined,
    };

    // Remove undefined fields
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });

    // Add seller profile if it exists
    if (sellerProfile) {
      userData.sellerProfile = {
        _id: sellerProfile._id,
        status: sellerProfile.status,
        storeName: sellerProfile.storeName,
        phone: sellerProfile.phone,
        documents: sellerProfile.documents || [],
        approvedAt: sellerProfile.approvedAt
      };
    }

    res.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { email, firstName, lastName, phoneNumber, personalNumber, role, roles } = req.body;

    // Update user fields safely - only update fields that are provided
    if (email !== undefined) {
      user.email = email;
    }
    
    // Update optional fields if they exist in the request
    // These fields may not be in the schema, so we use type assertion
    if (firstName !== undefined) {
      (user as any).firstName = firstName;
    }
    if (lastName !== undefined) {
      (user as any).lastName = lastName;
    }
    if (phoneNumber !== undefined) {
      (user as any).phoneNumber = phoneNumber;
    }
    if (personalNumber !== undefined) {
      (user as any).personalNumber = personalNumber;
    }

    // DO NOT update role/roles fields from the request body to prevent validation errors
    // Roles should only be updated through admin endpoints or during registration/login
    // If role or roles are sent, ignore them to prevent validation errors

    // Save the user
    try {
      await user.save();
    } catch (saveError: any) {
      // If there's a validation error related to role, normalize it
      if (saveError?.message?.includes('role') && saveError?.message?.includes('enum')) {
        console.warn('Role validation error detected, normalizing role field');
        // Normalize any invalid role values
        if ((user as any).role && (user as any).role === 'customer') {
          (user as any).role = 'user';
        }
        if (user.roles && Array.isArray(user.roles)) {
          user.roles = user.roles.map(r => r === 'customer' ? 'user' : r);
        }
        // Try saving again
        await user.save();
      } else {
        throw saveError;
      }
    }

    // Fetch the updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    // Normalize roles - handle both old and new structures
    const normalizedRoles = updatedUser.roles && Array.isArray(updatedUser.roles) && updatedUser.roles.length > 0
      ? updatedUser.roles
      : ((updatedUser as any).role ? [(updatedUser as any).role] : ['user']);

    // Get seller profile if user has seller role
    let sellerProfile = null;
    try {
      if (normalizedRoles.includes('seller')) {
        sellerProfile = await SellerProfile.findOne({ userId: updatedUser._id });
      }
    } catch (sellerProfileError) {
      console.error('Error fetching seller profile:', sellerProfileError);
      // Continue without seller profile if there's an error
    }

    // Return user data with all optional fields safely accessed (same format as getProfile)
    const userData: any = {
      id: updatedUser._id,
      email: updatedUser.email,
      roles: normalizedRoles,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      // Add optional fields if they exist
      firstName: (updatedUser as any).firstName || undefined,
      lastName: (updatedUser as any).lastName || undefined,
      phoneNumber: (updatedUser as any).phoneNumber || undefined,
      personalNumber: (updatedUser as any).personalNumber || undefined,
      balance: updatedUser.balance ?? 0,
      businessName: (updatedUser as any).businessName || undefined,
      businessAddress: (updatedUser as any).businessAddress || undefined,
    };

    // Remove undefined fields
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });

    // Add seller profile if it exists
    if (sellerProfile) {
      userData.sellerProfile = {
        _id: sellerProfile._id,
        status: sellerProfile.status,
        storeName: sellerProfile.storeName,
        phone: sellerProfile.phone,
        documents: sellerProfile.documents || [],
        approvedAt: sellerProfile.approvedAt
      };
    }

    res.json(userData);
  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 