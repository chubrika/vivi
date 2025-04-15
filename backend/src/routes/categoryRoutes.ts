import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (authentication required)
router.use(authenticateToken);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router; 