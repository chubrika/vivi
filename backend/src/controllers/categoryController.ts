import { Request, Response } from 'express';
import Category from '../models/Category';
import mongoose from 'mongoose';

interface CategoryWithChildren {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  parentId?: mongoose.Types.ObjectId;
  hasChildren: boolean;
  isActive: boolean;
  children?: CategoryWithChildren[];
}

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // Get all categories
    const categories = await Category.find().sort({ name: 1 });

    // Recursive function to get all nested children
    const getNestedChildren = async (parentId: mongoose.Types.ObjectId): Promise<CategoryWithChildren[]> => {
      const children = await Category.find({ parentId }).sort({ name: 1 });
      
      // For each child, recursively get its children if it has any
      const childrenWithNested = await Promise.all(children.map(async (child) => {
        if (child.hasChildren) {
          const nestedChildren = await getNestedChildren(child._id);
          return {
            ...child.toObject(),
            children: nestedChildren
          } as CategoryWithChildren;
        }
        return child.toObject() as CategoryWithChildren;
      }));

      return childrenWithNested;
    };

    // For each category, get all nested children
    const categoriesWithChildren = await Promise.all(categories.map(async (category) => {
      if (category.hasChildren) {
        const children = await getNestedChildren(category._id);
        return {
          ...category.toObject(),
          children
        } as CategoryWithChildren;
      }
      return category.toObject() as CategoryWithChildren;
    }));

    // Filter to get only root categories (no parent)
    const rootCategories = categoriesWithChildren.filter(cat => !cat.parentId);

    res.json(rootCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Create new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { parentId, name, description, isActive } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      
      // Update the parent's hasChildren property
      await Category.findByIdAndUpdate(
        parentId,
        { hasChildren: true },
        { new: true }
      );
    }

    const category = new Category({
      name,
      description,
      parentId,
      isActive: isActive !== undefined ? isActive : true,
      hasChildren: false
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          error: error.message,
          details: error instanceof mongoose.Error.ValidationError ? error.errors : undefined
        });
      }
      if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        return res.status(400).json({ message: 'Category name must be unique' });
      }
    }
    res.status(500).json({ message: 'Error creating category', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If parentId is changing, update both old and new parent's hasChildren property
    if (parentId !== category.parentId?.toString()) {
      // Update old parent's hasChildren if it exists
      if (category.parentId) {
        const oldParent = await Category.findById(category.parentId);
        if (oldParent) {
          const hasOtherChildren = await Category.exists({ 
            parentId: category.parentId, 
            _id: { $ne: category._id } 
          });
          await Category.findByIdAndUpdate(
            category.parentId,
            { hasChildren: hasOtherChildren },
            { new: true }
          );
        }
      }

      // Update new parent's hasChildren
      if (parentId) {
        await Category.findByIdAndUpdate(
          parentId,
          { hasChildren: true },
          { new: true }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If category has a parent, check if parent still has other children
    if (category.parentId) {
      const hasOtherChildren = await Category.exists({ 
        parentId: category.parentId, 
        _id: { $ne: category._id } 
      });
      
      // Update parent's hasChildren property
      await Category.findByIdAndUpdate(
        category.parentId,
        { hasChildren: hasOtherChildren },
        { new: true }
      );
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
}; 