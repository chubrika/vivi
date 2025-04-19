import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySeller,
  searchProducts
} from '../controllers/productController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

// Protected routes (authentication required)
router.use(authenticateToken);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/seller/:sellerId', getProductsBySeller);

export default router; 