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

// Admin only routes
router.use(authorize('admin'));

router
  .route('/')
  .post(createFilter)
  .get(getAllFilters);

// Search route
router.get('/search', getAllFilters);

router
  .route('/:id')
  .get(getFilterById)
  .patch(updateFilter)
  .delete(deleteFilter);

export default router; 