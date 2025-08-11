import express from 'express';
import { createWidgetGroup, getWidgetGroups, updateWidgetGroup, deleteWidgetGroup } from '../controllers/widgetGroup.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new widget group
router.post('/', authenticateToken, createWidgetGroup);

// Get all widget groups
router.get('/', getWidgetGroups);

// Update a widget group
router.put('/:id', authenticateToken, updateWidgetGroup);

// Delete a widget group
router.delete('/:id', authenticateToken, deleteWidgetGroup);

export default router; 