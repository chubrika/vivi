import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySeller,
  searchProducts
} from '../controllers/productController';
import Product from '../models/Product';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);

// Public route to get products by seller ID (no authentication required)
router.get('/seller/:sellerId/public', async (req, res) => {
  try {
    const products = await Product.find({ 
      seller: req.params.sellerId,
      isActive: true 
    })
      .populate('seller', 'storeName email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by seller:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Protected routes (authentication required)
router.use(authenticateToken);

router.get('/seller/:sellerId', getProductsBySeller);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router; 