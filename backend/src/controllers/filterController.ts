import { Request, Response } from 'express';
import Filter from '../models/Filter';

// Create a new filter
export const createFilter = async (req: Request, res: Response) => {
  try {
    const { name, description, category } = req.body;

    const filter = await Filter.create({
      name,
      description,
      category
    });

    res.status(201).json(filter);
  } catch (error) {
    res.status(500).json({ message: 'Error creating filter', error });
  }
};

// Get all filters
export const getAllFilters = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    
    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const filters = await Filter.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
      
    res.json(filters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filters', error });
  }
};

// Get a single filter by ID
export const getFilterById = async (req: Request, res: Response) => {
  try {
    const filter = await Filter.findById(req.params.id)
      .populate('category', 'name');
      
    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }
    
    res.json(filter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filter', error });
  }
};

// Update a filter
export const updateFilter = async (req: Request, res: Response) => {
  try {
    const { name, description, category, isActive } = req.body;
    
    const filter = await Filter.findByIdAndUpdate(
      req.params.id,
      { name, description, category, isActive },
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }
    
    res.json(filter);
  } catch (error) {
    res.status(500).json({ message: 'Error updating filter', error });
  }
};

// Delete a filter
export const deleteFilter = async (req: Request, res: Response) => {
  try {
    const filter = await Filter.findByIdAndDelete(req.params.id);
    
    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }
    
    res.json({ message: 'Filter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting filter', error });
  }
}; 