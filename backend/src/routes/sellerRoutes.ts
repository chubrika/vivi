import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller
} from '../controllers/sellerController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all sellers
router.get('/', getAllSellers);

// Get seller by ID
router.get('/:id', getSellerById);

// Create new seller
router.post('/', createSeller);

// Update seller
router.put('/:id', updateSeller);

// Delete seller
router.delete('/:id', deleteSeller);

export default router; 