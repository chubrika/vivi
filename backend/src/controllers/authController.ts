import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user - password will be hashed by the User model's pre-save middleware
    const user = new User({
      firstName,
      lastName,
      email,
      password, // Pass the plain password, let the model hash it
      role: 'user' // Explicitly set role
    });

    await user.save();

    // Get JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Create token with explicit string conversion
      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          role: user.role || 'user' // Ensure role is defined
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role || 'user'
        },
      });
    } catch (jwtError) {
      console.error('JWT Signing Error:', jwtError);
      return res.status(500).json({ message: 'Error creating authentication token' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
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
    console.log('User found:', { id: user._id, email: user.email, role: user.role });

    // Check password using the user's comparePassword method
    const isValidPassword = await user.comparePassword(password);
    console.log('Password validation result:', isValidPassword);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Create token with explicit string conversion and role check
      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          role: user.role || 'user' // Ensure role is defined
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('Login successful for user:', email);
      res.json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role || 'user'
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
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 