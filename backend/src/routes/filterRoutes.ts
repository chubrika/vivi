import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  createFilter,
  getAllFilters,
  getFilterById,
  updateFilter,
  deleteFilter
} from '../controllers/filterController';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllFilters);
router.get('/search', getAllFilters);
router.get('/:id', getFilterById);

// Protected routes - require authentication
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router
  .route('/')
  .post(createFilter);

router
  .route('/:id')
  .patch(updateFilter)
  .delete(deleteFilter);

export default router; 