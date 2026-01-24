import express from 'express';
import {
  updateSellerProfile,
  getSellerProfile,
  getPendingSellers,
  getAllSellers,
  approveSeller,
  rejectSeller,
  suspendSeller
} from '../controllers/sellerProfileController';
import { requireAuth, requireRole, requireApprovedSeller } from '../middleware/auth';

const router = express.Router();

// Seller routes (require authentication)
router.get('/me', requireAuth, getSellerProfile);
router.patch('/me', requireAuth, updateSellerProfile);

// Admin routes (require admin role)
router.get('/pending', requireAuth, requireRole('admin'), getPendingSellers);
router.get('/all', requireAuth, requireRole('admin'), getAllSellers);
router.post('/:sellerProfileId/approve', requireAuth, requireRole('admin'), approveSeller);
router.post('/:sellerProfileId/reject', requireAuth, requireRole('admin'), rejectSeller);
router.post('/:sellerProfileId/suspend', requireAuth, requireRole('admin'), suspendSeller);

export default router;
