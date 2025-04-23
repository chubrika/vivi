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

// Protect all routes after this middleware
router.use(protect);

// Routes accessible by both admin and seller
router.get('/', getAllFilters);
router.get('/search', getAllFilters);
router.get('/:id', getFilterById);

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