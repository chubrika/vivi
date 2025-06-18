import express from 'express';
import { createWidgetGroup, getWidgetGroups } from '../controllers/widgetGroup.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new widget group
router.post('/', authenticateToken, createWidgetGroup);

// Get all widget groups
router.get('/', getWidgetGroups);

export default router; 