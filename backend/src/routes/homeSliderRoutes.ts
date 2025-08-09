import express from 'express';
import { 
  createHomeSlider, 
  getHomeSliders, 
  getHomeSliderById, 
  updateHomeSlider, 
  deleteHomeSlider 
} from '../controllers/homeSliderController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new home slider (admin only)
router.post('/', authenticateToken, createHomeSlider);

// Get all home sliders (public)
router.get('/', getHomeSliders);

// Get home slider by ID (public)
router.get('/:id', getHomeSliderById);

// Update home slider (admin only)
router.put('/:id', authenticateToken, updateHomeSlider);

// Delete home slider (admin only)
router.delete('/:id', authenticateToken, deleteHomeSlider);

export default router; 