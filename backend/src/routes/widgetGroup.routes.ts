import express from 'express';
import {
  createWidgetGroup,
  getWidgetGroups,
  updateWidgetGroup,
  deleteWidgetGroup,
  reorderWidgetGroups,
} from '../controllers/widgetGroup.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET: Redis cache "widget-groups:all"; miss → MongoDB (.lean()), then cache 1h
router.get('/', getWidgetGroups);

// Writes: update MongoDB, invalidate "widget-groups:all"; do not cache responses
router.post('/', authenticateToken, createWidgetGroup);
router.patch('/reorder', authenticateToken, reorderWidgetGroups);
router.put('/:id', authenticateToken, updateWidgetGroup);
router.delete('/:id', authenticateToken, deleteWidgetGroup);

export default router; 