import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySeller
} from '../controllers/productController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all products
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create new product
router.post('/', createProduct);

// Update product
router.put('/:id', updateProduct);

// Delete product
router.delete('/:id', deleteProduct);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);

// Get products by seller
router.get('/seller/:sellerId', getProductsBySeller);

export default router; 