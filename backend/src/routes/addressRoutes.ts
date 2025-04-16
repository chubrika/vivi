import express from 'express';
import { auth } from '../middleware/auth';
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController';

const router = express.Router();

// Get all addresses for the authenticated user
router.get('/', auth, getAddresses);

// Get a single address by ID
router.get('/:id', auth, getAddressById);

// Create a new address
router.post('/', auth, createAddress);

// Update an address
router.put('/:id', auth, updateAddress);

// Delete an address
router.delete('/:id', auth, deleteAddress);

export default router; 