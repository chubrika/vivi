import express, { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import Component from '../models/Component';

const router = express.Router();

// Get all components
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const components = await Component.find().sort({ createdAt: -1 });
    return res.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a single component
router.get('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    return res.json(component);
  } catch (error) {
    console.error('Error fetching component:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new component
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, stock } = req.body;

    // Validate required fields
    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new component
    const component = new Component({
      name,
      description,
      category,
      price,
      stock,
    });

    await component.save();
    return res.status(201).json(component);
  } catch (error) {
    console.error('Error creating component:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a component
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, stock } = req.body;

    // Find and update component
    const component = await Component.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        price,
        stock,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    return res.json(component);
  } catch (error) {
    console.error('Error updating component:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a component
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    return res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 