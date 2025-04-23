import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller
} from '../controllers/sellerController';
import User from '../models/User';

const router = express.Router();

// Public route to get all sellers (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('firstName lastName email phoneNumber businessName businessAddress isActive')
      .sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching public sellers:', error);
    res.status(500).json({ message: 'Error fetching sellers' });
  }
});

// Public route to get a single seller by ID (no authentication required)
router.get('/public/:id', async (req, res) => {
  try {
    const seller = await User.findOne({ _id: req.params.id, role: 'seller' })
      .select('firstName lastName email phoneNumber businessName businessAddress isActive');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Error fetching public seller:', error);
    res.status(500).json({ message: 'Error fetching seller' });
  }
});

// Apply authentication middleware to all routes below
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