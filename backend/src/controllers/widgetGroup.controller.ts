import { Request, Response } from 'express';
import { WidgetGroup } from '../models/widgetGroup.model';

export const createWidgetGroup = async (req: Request, res: Response) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid widget group data. Must contain exactly 4 categories.'
      });
    }

    const widgetGroup = new WidgetGroup({
      categories: categories.map(category => ({
        categoryId: category._id,
        name: category.name,
        image: category.image || '',
        mobileImage: category.mobileImage || '',
        slug: category.slug
      }))
    });

    await widgetGroup.save();

    res.status(201).json({
      success: true,
      data: widgetGroup
    });
  } catch (error) {
    console.error('Error creating widget group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create widget group'
    });
  }
};

export const getWidgetGroups = async (req: Request, res: Response) => {
  try {
    const widgetGroups = await WidgetGroup.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: widgetGroups
    });
  } catch (error) {
    console.error('Error fetching widget groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widget groups'
    });
  }
};

export const updateWidgetGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid widget group data. Must contain exactly 4 categories.'
      });
    }

    const widgetGroup = await WidgetGroup.findById(id);
    if (!widgetGroup) {
      return res.status(404).json({
        success: false,
        message: 'Widget group not found'
      });
    }

    widgetGroup.categories = categories.map(category => ({
      categoryId: category._id,
      name: category.name,
      image: category.image || '',
      mobileImage: category.mobileImage || '',
      slug: category.slug
    }));

    await widgetGroup.save();

    res.status(200).json({
      success: true,
      data: widgetGroup
    });
  } catch (error) {
    console.error('Error updating widget group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update widget group'
    });
  }
};

export const deleteWidgetGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const widgetGroup = await WidgetGroup.findByIdAndDelete(id);
    if (!widgetGroup) {
      return res.status(404).json({
        success: false,
        message: 'Widget group not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Widget group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting widget group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete widget group'
    });
  }
}; 