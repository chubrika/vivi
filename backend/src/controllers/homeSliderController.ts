import { Request, Response } from 'express';
import { HomeSlider } from '../models/HomeSlider';

export const createHomeSlider = async (req: Request, res: Response) => {
  try {
    const { name, slug, desktopImage, mobileImage, categorySlug } = req.body;

    if (!name || !desktopImage || !mobileImage) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: name, desktopImage, mobileImage'
      });
    }

    // Check if either slug or categorySlug is provided
    if (!slug && !categorySlug) {
      return res.status(400).json({
        success: false,
        message: 'Either slug or categorySlug must be provided'
      });
    }

    // Check if slug already exists
    const existingSlider = await HomeSlider.findOne({ slug });
    if (existingSlider) {
      return res.status(400).json({
        success: false,
        message: 'Slider with this slug already exists'
      });
    }

    const homeSlider = new HomeSlider({
      name,
      slug,
      desktopImage,
      mobileImage,
      categorySlug
    });

    await homeSlider.save();

    res.status(201).json({
      success: true,
      data: homeSlider
    });
  } catch (error) {
    console.error('Error creating home slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create home slider'
    });
  }
};

export const getHomeSliders = async (req: Request, res: Response) => {
  try {
    const homeSliders = await HomeSlider.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: homeSliders
    });
  } catch (error) {
    console.error('Error fetching home sliders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home sliders'
    });
  }
};

export const getHomeSliderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const homeSlider = await HomeSlider.findById(id);

    if (!homeSlider) {
      return res.status(404).json({
        success: false,
        message: 'Home slider not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homeSlider
    });
  } catch (error) {
    console.error('Error fetching home slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home slider'
    });
  }
};

export const updateHomeSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, desktopImage, mobileImage, categorySlug, isActive, order } = req.body;

    const homeSlider = await HomeSlider.findById(id);
    if (!homeSlider) {
      return res.status(404).json({
        success: false,
        message: 'Home slider not found'
      });
    }

    // Check if slug already exists (excluding current slider)
    if (slug && slug !== homeSlider.slug) {
      const existingSlider = await HomeSlider.findOne({ slug, _id: { $ne: id } });
      if (existingSlider) {
        return res.status(400).json({
          success: false,
          message: 'Slider with this slug already exists'
        });
      }
    }

    const updatedSlider = await HomeSlider.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        desktopImage,
        mobileImage,
        categorySlug,
        isActive,
        order,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSlider
    });
  } catch (error) {
    console.error('Error updating home slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update home slider'
    });
  }
};

export const deleteHomeSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const homeSlider = await HomeSlider.findByIdAndDelete(id);

    if (!homeSlider) {
      return res.status(404).json({
        success: false,
        message: 'Home slider not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Home slider deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting home slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete home slider'
    });
  }
}; 