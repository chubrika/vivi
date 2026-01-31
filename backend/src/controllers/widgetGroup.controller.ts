import { Request, Response } from 'express';
import { WidgetGroup } from '../models/widgetGroup.model';
import {
  getRedisClient,
  invalidateWidgetGroupsCache,
  WIDGET_GROUPS_CACHE_KEY,
  WIDGET_GROUPS_CACHE_TTL_SECONDS,
} from '../lib/redis';

// =============================================================================
// GET /api/widget-groups — Read path with Redis caching
// =============================================================================
// Flow:
// 1. Check Redis key "widget-groups:all".
// 2. Cache hit → return cached JSON { success: true, data: WidgetGroup[] }.
// 3. Cache miss → fetch from MongoDB (.lean() for performance), sort by groupNumber,
//    store in Redis with TTL 1h, return. We do NOT cache write responses.
// =============================================================================

export const getWidgetGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const redis = await getRedisClient();

    if (redis) {
      const cached = await redis.get(WIDGET_GROUPS_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as { success: boolean; data: unknown[] };
        res.status(200).json(data);
        return;
      }
    }

    const list = await WidgetGroup.find()
      .sort({ groupNumber: 1 })
      .lean();

    const data = list.map((doc) => ({
      ...doc,
      _id: (doc as { _id: unknown })._id?.toString?.() ?? String((doc as { _id: unknown })._id),
    }));

    const payload = { success: true, data };

    if (redis) {
      await redis.setex(
        WIDGET_GROUPS_CACHE_KEY,
        WIDGET_GROUPS_CACHE_TTL_SECONDS,
        JSON.stringify(payload)
      );
    }

    res.status(200).json(payload);
  } catch (error) {
    console.error('Error fetching widget groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widget groups',
    });
  }
};

// =============================================================================
// Write handlers (POST / PUT / DELETE / PATCH reorder)
// =============================================================================
// After ANY write: update MongoDB, then invalidate Redis key "widget-groups:all"
// so the next GET loads fresh data. Write responses are never cached.
// Error handling: 400 validation, 404 not found, 500 server error.
// =============================================================================

export const createWidgetGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { widgetName, categories } = req.body;

    if (!widgetName || typeof widgetName !== 'string' || widgetName.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Widget name is required.',
      });
      return;
    }

    if (!categories || !Array.isArray(categories) || categories.length !== 4) {
      res.status(400).json({
        success: false,
        message: 'Invalid widget group data. Must contain exactly 4 categories.',
      });
      return;
    }

    const widgetGroup = new WidgetGroup({
      widgetName: widgetName.trim(),
      categories: categories.map((c: { _id?: string; categoryId?: string; name: string; image?: string; mobileImage?: string; slug: string }) => ({
        categoryId: String(c._id ?? c.categoryId ?? ''),
        name: c.name,
        image: c.image ?? '',
        mobileImage: c.mobileImage ?? '',
        slug: c.slug,
      })),
    });

    await widgetGroup.save();

    await invalidateWidgetGroupsCache();

    res.status(201).json({
      success: true,
      data: widgetGroup,
    });
  } catch (error) {
    console.error('Error creating widget group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create widget group',
    });
  }
};

export const updateWidgetGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { widgetName, categories } = req.body;

    if (!widgetName || typeof widgetName !== 'string' || widgetName.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Widget name is required.',
      });
      return;
    }

    if (!categories || !Array.isArray(categories) || categories.length !== 4) {
      res.status(400).json({
        success: false,
        message: 'Invalid widget group data. Must contain exactly 4 categories.',
      });
      return;
    }

    const widgetGroup = await WidgetGroup.findById(id);
    if (!widgetGroup) {
      res.status(404).json({
        success: false,
        message: 'Widget group not found',
      });
      return;
    }

    widgetGroup.widgetName = widgetName.trim();
    widgetGroup.categories = categories.map((c: { _id?: string; categoryId?: string; name: string; image?: string; mobileImage?: string; slug: string }) => ({
      categoryId: String(c._id ?? c.categoryId ?? ''),
      name: c.name,
      image: c.image ?? '',
      mobileImage: c.mobileImage ?? '',
      slug: c.slug,
    }));

    await widgetGroup.save();

    await invalidateWidgetGroupsCache();

    res.status(200).json({
      success: true,
      data: widgetGroup,
    });
  } catch (error) {
    console.error('Error updating widget group (PUT /:id):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update widget group',
    });
  }
};

export const deleteWidgetGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const widgetGroup = await WidgetGroup.findByIdAndDelete(id);
    if (!widgetGroup) {
      res.status(404).json({
        success: false,
        message: 'Widget group not found',
      });
      return;
    }

    await invalidateWidgetGroupsCache();

    res.status(200).json({
      success: true,
      message: 'Widget group deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting widget group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete widget group',
    });
  }
};

/**
 * Reorder widget groups by groupNumber. Body: { order: Array<{ id: string, groupNumber: number }> }.
 * After reorder we invalidate cache so GET returns new order.
 */
export const reorderWidgetGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || order.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Body must contain order: [{ id, groupNumber }, ...].',
      });
      return;
    }

    const updates = order.map(
      async (item: { id: string; groupNumber: number }) =>
        WidgetGroup.findByIdAndUpdate(item.id, { groupNumber: item.groupNumber }, { new: true })
    );
    await Promise.all(updates);

    await invalidateWidgetGroupsCache();

    res.status(200).json({
      success: true,
      message: 'Widget groups reordered',
    });
  } catch (error) {
    console.error('Error reordering widget groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder widget groups',
    });
  }
};
