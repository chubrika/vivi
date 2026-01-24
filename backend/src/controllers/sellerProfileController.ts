import { Request, Response } from 'express';
import SellerProfile from '../models/SellerProfile';
import User from '../models/User';

// Seller onboarding - update SellerProfile (storeName, phone, documents)
export const updateSellerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { storeName, phone, documents } = req.body;

    // Find seller profile
    const sellerProfile = await SellerProfile.findOne({ userId });
    
    if (!sellerProfile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    // Update fields (storeName, phone, documents) - all seller statuses can update
    if (storeName !== undefined) sellerProfile.storeName = storeName;
    if (phone !== undefined) sellerProfile.phone = phone;
    if (documents !== undefined && Array.isArray(documents)) {
      sellerProfile.documents = documents.map((doc: any) => ({
        id: doc.id,
        type: doc.type,
        url: doc.url,
        uploadedAt: doc.uploadedAt || new Date()
      }));
    }

    await sellerProfile.save();

    res.json({
      message: 'Seller profile updated successfully',
      sellerProfile: {
        _id: sellerProfile._id,
        status: sellerProfile.status,
        storeName: sellerProfile.storeName,
        phone: sellerProfile.phone,
        documents: sellerProfile.documents
      }
    });
  } catch (error) {
    console.error('Seller profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get seller's own profile
export const getSellerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    
    const sellerProfile = await SellerProfile.findOne({ userId })
      .populate('userId', 'email roles');
    
    if (!sellerProfile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    res.json(sellerProfile);
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all pending sellers
export const getPendingSellers = async (req: Request, res: Response) => {
  try {
    const pendingSellers = await SellerProfile.find({ status: 'pending' })
      .populate('userId', 'email roles createdAt')
      .sort({ createdAt: -1 });

    res.json(pendingSellers);
  } catch (error) {
    console.error('Get pending sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all sellers (all statuses)
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await SellerProfile.find()
      .populate('userId', 'email roles createdAt')
      .sort({ createdAt: -1 });

    res.json(sellers);
  } catch (error) {
    console.error('Get all sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Approve seller
export const approveSeller = async (req: Request, res: Response) => {
  try {
    const { sellerProfileId } = req.params;

    const sellerProfile = await SellerProfile.findById(sellerProfileId)
      .populate('userId');
    
    if (!sellerProfile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    if (sellerProfile.status !== 'pending') {
      return res.status(400).json({ 
        message: `Seller is already ${sellerProfile.status}. Only pending sellers can be approved.` 
      });
    }

    // Update SellerProfile status to approved
    sellerProfile.status = 'approved';
    sellerProfile.approvedAt = new Date();
    await sellerProfile.save();

    // Add 'seller' role to User
    const user = await User.findById(sellerProfile.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('seller')) {
      user.roles.push('seller');
      await user.save();
    }

    res.json({
      message: 'Seller approved successfully',
      sellerProfile: {
        _id: sellerProfile._id,
        status: sellerProfile.status,
        approvedAt: sellerProfile.approvedAt
      },
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Approve seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Reject seller
export const rejectSeller = async (req: Request, res: Response) => {
  try {
    const { sellerProfileId } = req.params;
    const { reason } = req.body; // Optional rejection reason

    const sellerProfile = await SellerProfile.findById(sellerProfileId)
      .populate('userId');
    
    if (!sellerProfile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    if (sellerProfile.status !== 'pending') {
      return res.status(400).json({ 
        message: `Seller is already ${sellerProfile.status}. Only pending sellers can be rejected.` 
      });
    }

    // Update SellerProfile status to rejected
    sellerProfile.status = 'rejected';
    await sellerProfile.save();

    // Ensure user only has 'user' role (remove 'seller' if it exists)
    const user = await User.findById(sellerProfile.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove 'seller' role if present
    user.roles = user.roles.filter(role => role !== 'seller');
    await user.save();

    res.json({
      message: 'Seller rejected successfully',
      sellerProfile: {
        _id: sellerProfile._id,
        status: sellerProfile.status
      },
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles
      },
      ...(reason && { reason })
    });
  } catch (error) {
    console.error('Reject seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Suspend seller
export const suspendSeller = async (req: Request, res: Response) => {
  try {
    const { sellerProfileId } = req.params;
    const { reason } = req.body; // Optional suspension reason

    const sellerProfile = await SellerProfile.findById(sellerProfileId);
    
    if (!sellerProfile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    if (sellerProfile.status === 'suspended') {
      return res.status(400).json({ message: 'Seller is already suspended' });
    }

    // Update SellerProfile status to suspended
    sellerProfile.status = 'suspended';
    await sellerProfile.save();

    // Note: We keep the 'seller' role but the status prevents them from creating products

    res.json({
      message: 'Seller suspended successfully',
      sellerProfile: {
        _id: sellerProfile._id,
        status: sellerProfile.status
      },
      ...(reason && { reason })
    });
  } catch (error) {
    console.error('Suspend seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
