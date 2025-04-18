import { Request, Response } from 'express';
import Product from '../models/Product';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Create base query
    const query: any = {};
    
    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate product features if provided
    if (req.body.productFeatureValues) {
      try {
        validateProductFeatures(req.body.productFeatureValues);
      } catch (validationError) {
        return res.status(400).json({ 
          message: 'Validation error in product features', 
          error: validationError instanceof Error ? validationError.message : 'Invalid feature data'
        });
      }
    }
    
    const product = new Product(req.body);
    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'name email')
      .populate('category', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          error: error.message 
        });
      }
      return res.status(500).json({ 
        message: 'Error creating product', 
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Error creating product', 
      error: 'An unexpected error occurred' 
    });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Validate product features if provided
    if (req.body.productFeatureValues) {
      validateProductFeatures(req.body.productFeatureValues);
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name email').populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ category: req.params.categoryId })
      .populate('seller', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error });
  }
};

// Get products by seller
export const getProductsBySeller = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ seller: req.params.sellerId })
      .populate('seller', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by seller', error });
  }
};

// Helper function to validate product features
const validateProductFeatures = (featureGroups: any[]) => {
  if (!Array.isArray(featureGroups)) {
    throw new Error('Product features must be an array');
  }

  featureGroups.forEach((group, groupIndex) => {
    if (!group.featureGroupId || typeof group.featureGroupId !== 'number') {
      throw new Error(`Feature group at index ${groupIndex} must have a numeric featureGroupId`);
    }
    
    if (!group.featureGroupCaption || typeof group.featureGroupCaption !== 'string') {
      throw new Error(`Feature group at index ${groupIndex} must have a string featureGroupCaption`);
    }
    
    if (!Array.isArray(group.features)) {
      throw new Error(`Feature group at index ${groupIndex} must have an array of features`);
    }
    
    group.features.forEach((feature: any, featureIndex: number) => {
      if (!feature.featureId || typeof feature.featureId !== 'number') {
        throw new Error(`Feature at index ${featureIndex} in group ${groupIndex} must have a numeric featureId`);
      }
      
      if (!feature.featureCaption || typeof feature.featureCaption !== 'string') {
        throw new Error(`Feature at index ${featureIndex} in group ${groupIndex} must have a string featureCaption`);
      }
      
      if (!Array.isArray(feature.featureValues)) {
        throw new Error(`Feature at index ${featureIndex} in group ${groupIndex} must have an array of featureValues`);
      }
      
      feature.featureValues.forEach((value: any, valueIndex: number) => {
        if (value.type !== undefined && typeof value.type !== 'number') {
          throw new Error(`Feature value at index ${valueIndex} in feature ${featureIndex} in group ${groupIndex} must have a numeric type`);
        }
        
        if (!value.featureValue || typeof value.featureValue !== 'string') {
          throw new Error(`Feature value at index ${valueIndex} in feature ${featureIndex} in group ${groupIndex} must have a string featureValue`);
        }
      });
    });
  });
}; 