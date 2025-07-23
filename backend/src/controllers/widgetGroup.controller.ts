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