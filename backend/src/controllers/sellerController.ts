import { Request, Response } from 'express';
import Seller from '../models/Seller';

// Get all sellers
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sellers', error });
  }
};

// Get seller by ID
export const getSellerById = async (req: Request, res: Response) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seller', error });
  }
};

// Create new seller
export const createSeller = async (req: Request, res: Response) => {
  try {
    const seller = new Seller(req.body);
    await seller.save();
    res.status(201).json(seller);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating seller', error });
  }
};

// Update seller
export const updateSeller = async (req: Request, res: Response) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating seller', error });
  }
};

// Delete seller
export const deleteSeller = async (req: Request, res: Response) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json({ message: 'Seller deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting seller', error });
  }
}; 