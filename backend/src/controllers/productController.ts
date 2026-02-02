import { Request, Response } from 'express';
import slugify from 'slugify';
import Product from '../models/Product';
import User from '../models/User';
import Category from '../models/Category';
import Filter from '../models/Filter';
import SellerProfile from '../models/SellerProfile';
import mongoose from 'mongoose';
import {
  getRedisClient,
  invalidateFeaturedProductsCache,
  PRODUCTS_FEATURED_CACHE_KEY,
  PRODUCTS_FEATURED_CACHE_TTL_SECONDS,
} from '../lib/redis';

const FEATURED_PRODUCTS_LIMIT = 6;

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    
    // Add category filter if provided
    if (req.query.category) {
      // First try to find the category by slug
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        query.category = category._id;
      } else {
        // If not found by slug, try using the value directly (for backward compatibility)
        query.category = req.query.category;
      }
    }
    
    // Add seller filter if provided
    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    // Handle filter parameters (keys are filter slugs)
    const filterParams = Object.entries(req.query)
      .filter(([key]) => {
        // Exclude known query parameters
        return key !== 'category' && key !== 'seller' && key !== 'minPrice' && key !== 'maxPrice';
      })
      .map(([key, value]) => ({
        filterSlug: key,
        values: (value as string).split(',')
      }));

    if (filterParams.length > 0) {
      // Convert filter slugs to IDs and build filter conditions
      const filterConditions = await Promise.all(
        filterParams.map(async (fp) => {
          // Build query to find filter - only use _id if it's a valid ObjectId
          const filterQuery: any = { slug: fp.filterSlug };
          if (mongoose.Types.ObjectId.isValid(fp.filterSlug)) {
            filterQuery._id = fp.filterSlug;
          }
          
          // Try to find filter by slug first, then by ID (for backward compatibility)
          const foundFilter = await Filter.findOne({
            $or: [
              { slug: fp.filterSlug },
              ...(mongoose.Types.ObjectId.isValid(fp.filterSlug) ? [{ _id: fp.filterSlug }] : [])
            ]
          });

          if (foundFilter) {
            // Match products where filters array contains an object with matching id (or slug) and value
            // Support multiple values (comma-separated)
            return {
              filters: {
                $elemMatch: {
                  $or: [
                    { id: foundFilter._id.toString() },
                    { slug: foundFilter.slug }
                  ],
                  value: { $in: fp.values }
                }
              }
            };
          }
          // If filter not found, still try to match by slug (in case it's stored in products)
          return {
            filters: {
              $elemMatch: {
                $or: [
                  { slug: fp.filterSlug }
                ],
                value: { $in: fp.values }
              }
            }
          };
        })
      );

      const validConditions = filterConditions.filter(Boolean);
      if (validConditions.length > 0) {
        // Use $and to ensure ALL filter conditions are met
        if (!query.$and) {
          query.$and = [];
        }
        query.$and.push(...validConditions);
      }
    }

    // Find products first (without price filter); .lean() so seller is a plain object
    // and our storeName/phone merge is not stripped by Mongoose toJSON
    let products = await Product.find(query)
      .populate('seller', 'email')
      .populate('category', 'name slug parentId')
      .populate('filters', 'name description type config')
      .sort({ createdAt: -1 })
      .lean();

    // Filter by price range if provided (consider discountedPrice if available)
    if (req.query.minPrice || req.query.maxPrice) {
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;
      
      products = products.filter(product => {
        // Use discountedPrice if available and valid, otherwise use price
        const effectivePrice = product.discountedPrice && product.discountedPrice > 0 
          ? product.discountedPrice 
          : product.price;
        return effectivePrice >= minPrice && effectivePrice <= maxPrice;
      });
    }

    // Join storeName (from storeName) and phone from sellerProfiles into seller
    const sellerIds = [...new Set(products.map(p => p.seller?._id).filter(Boolean))];
    if (sellerIds.length > 0) {
      const profiles = await SellerProfile.find({ userId: { $in: sellerIds } })
        .select('userId storeName phone')
        .lean();
      const profileByUserId = new Map(
        profiles.map((p: { userId: { toString: () => string }; storeName?: string; phone?: string }) => [
          p.userId.toString(),
          { storeName: p.storeName, phone: p.phone }
        ])
      );
      for (const product of products) {
        if (product.seller?._id) {
          const profile = profileByUserId.get(String(product.seller._id));
          const s = product.seller as unknown as Record<string, unknown>;
          s.storeName = profile?.storeName;
          s.phone = profile?.phone;
        }
      }
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get featured products (first N) — cached in Redis; invalidate on product create/update/delete
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || FEATURED_PRODUCTS_LIMIT, 20);

    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(PRODUCTS_FEATURED_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as unknown[];
        return res.json(data);
      }
    }

    let products = await Product.find({})
      .populate('seller', 'email')
      .populate('category', 'name slug parentId')
      .populate('filters', 'name description type config')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const sellerIds = [...new Set(products.map((p: { seller?: { _id?: unknown } }) => p.seller?._id).filter(Boolean))];
    if (sellerIds.length > 0) {
      const profiles = await SellerProfile.find({ userId: { $in: sellerIds } })
        .select('userId storeName phone')
        .lean();
      const profileByUserId = new Map(
        profiles.map((p: { userId: { toString: () => string }; storeName?: string; phone?: string }) => [
          p.userId.toString(),
          { storeName: p.storeName, phone: p.phone },
        ])
      );
      for (const product of products) {
        if (product.seller?._id) {
          const profile = profileByUserId.get(String(product.seller._id));
          const s = product.seller as unknown as Record<string, unknown>;
          s.storeName = profile?.storeName;
          s.phone = profile?.phone;
        }
      }
    }

    if (redis) {
      await redis.setex(
        PRODUCTS_FEATURED_CACHE_KEY,
        PRODUCTS_FEATURED_CACHE_TTL_SECONDS,
        JSON.stringify(products)
      );
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error });
  }
};

// Get product by ID or productSlug
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
    const product = isObjectId
      ? await Product.findById(id)
      : await Product.findOne({ productSlug: id });
    const populated = product
      ? await Product.findById(product._id)
          .populate('seller', 'storeName email')
          .populate('category', 'name slug')
          .populate('filters', 'name description')
      : null;
    if (!populated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(populated);
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
    
    // Verify that the seller exists and is a seller
    const seller = await User.findById(req.body.seller);
    if (!seller) {
      return res.status(400).json({ message: 'Seller not found' });
    }
    
    if (seller.roles && !seller.roles.includes('seller')) {
      return res.status(400).json({ message: 'The specified user is not a seller' });
    }

    // Slugify and validate unique productSlug if provided
    if (req.body.productSlug != null && String(req.body.productSlug).trim() !== '') {
      const slug = slugify(String(req.body.productSlug).trim(), { lower: true, strict: true });
      if (!slug) {
        return res.status(400).json({ message: 'Product slug is required and must contain at least one alphanumeric character' });
      }
      const existing = await Product.findOne({ productSlug: slug });
      if (existing) {
        return res.status(400).json({ message: 'A product with this slug already exists' });
      }
      req.body.productSlug = slug;
    }

    // Process filters - accept new format { id, value } where id can be filter ID or slug
    if (req.body.filters && Array.isArray(req.body.filters)) {
      // Convert filter slugs to IDs if needed
      const processedFilters = await Promise.all(
        req.body.filters.map(async (filter: any) => {
          if (typeof filter === 'object' && filter !== null && filter.id && filter.value) {
            // Already in new format { id, value } - id might be slug or ID
            // Try to find filter by slug first, then by ID
            const foundFilter = await Filter.findOne({ 
              $or: [
                { slug: filter.id },
                { _id: filter.id }
              ]
            });
            
            if (foundFilter) {
              // Use the filter ID for database storage
              return { id: foundFilter._id.toString(), value: filter.value };
            }
            // If not found, assume it's already an ID and keep as is
            return filter;
          } else if (typeof filter === 'string') {
            // Old format: "filterId:value" or just "filterId"
            if (filter.includes(':')) {
              const [id, value] = filter.split(':');
              // Try to find filter by slug first, then by ID
              const foundFilter = await Filter.findOne({ 
                $or: [
                  { slug: id },
                  { _id: id }
                ]
              });
              
              if (foundFilter) {
                return { id: foundFilter._id.toString(), value: value };
              }
              return { id, value };
            } else {
              // Just filter ID, no value - convert to new format
              const foundFilter = await Filter.findOne({ 
                $or: [
                  { slug: filter },
                  { _id: filter }
                ]
              });
              
              if (foundFilter) {
                return { id: foundFilter._id.toString(), value: '' };
              }
              return { id: filter, value: '' };
            }
          } else {
            // ObjectId or other format - convert to new format
            return { id: filter.toString(), value: '' };
          }
        })
      );
      
      req.body.filters = processedFilters;
    }
    
    const product = new Product(req.body);
    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'storeName email')
      .populate('category', 'name')
      .populate('filters', 'name description');
    await invalidateFeaturedProductsCache();
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
      try {
        validateProductFeatures(req.body.productFeatureValues);
      } catch (validationError) {
        return res.status(400).json({ 
          message: 'Validation error in product features', 
          error: validationError instanceof Error ? validationError.message : 'Invalid feature data'
        });
      }
    }
    
    // If seller is being updated, verify that the new seller exists and is a seller
    if (req.body.seller) {
      const seller = await User.findById(req.body.seller);
      if (!seller) {
        return res.status(400).json({ message: 'Seller not found' });
      }
      
      if (seller.roles && !seller.roles.includes('seller')) {
        return res.status(400).json({ message: 'The specified user is not a seller' });
      }
    }

    // Slugify and validate unique productSlug if provided
    if (req.body.productSlug != null && String(req.body.productSlug).trim() !== '') {
      const slug = slugify(String(req.body.productSlug).trim(), { lower: true, strict: true });
      if (!slug) {
        return res.status(400).json({ message: 'Product slug is required and must contain at least one alphanumeric character' });
      }
      const existing = await Product.findOne({ productSlug: slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'A product with this slug already exists' });
      }
      req.body.productSlug = slug;
    }

    // Process filters - accept new format { id, slug, value } where id can be filter ID or slug
    if (req.body.filters && Array.isArray(req.body.filters)) {
      // Convert filter slugs to IDs if needed, and ensure we have id, slug, and value
      const processedFilters = await Promise.all(
        req.body.filters.map(async (filter: any) => {
          if (typeof filter === 'object' && filter !== null && filter.id && filter.value) {
            // Already in new format { id, slug?, value } - id might be slug or ID
            // Try to find filter by slug first, then by ID
            const foundFilter = await Filter.findOne({ 
              $or: [
                { slug: filter.id },
                { _id: filter.id }
              ]
            });
            
            if (foundFilter) {
              // Use the filter ID and slug for database storage
              return { 
                id: foundFilter._id.toString(), 
                slug: foundFilter.slug,
                value: filter.value 
              };
            }
            // If not found but has slug, use it
            if (filter.slug) {
              return filter;
            }
            // If not found, assume it's already an ID and keep as is
            return filter;
          } else if (typeof filter === 'string') {
            // Old format: "filterId:value" or just "filterId"
            if (filter.includes(':')) {
              const [id, value] = filter.split(':');
              // Try to find filter by slug first, then by ID
              const foundFilter = await Filter.findOne({ 
                $or: [
                  { slug: id },
                  { _id: id }
                ]
              });
              
              if (foundFilter) {
                return { 
                  id: foundFilter._id.toString(), 
                  slug: foundFilter.slug,
                  value: value 
                };
              }
              return { id, value };
            } else {
              // Just filter ID, no value - convert to new format
              const foundFilter = await Filter.findOne({ 
                $or: [
                  { slug: filter },
                  { _id: filter }
                ]
              });
              
              if (foundFilter) {
                return { 
                  id: foundFilter._id.toString(), 
                  slug: foundFilter.slug,
                  value: '' 
                };
              }
              return { id: filter, value: '' };
            }
          } else {
            // ObjectId or other format - convert to new format
            return { id: filter.toString(), value: '' };
          }
        })
      );
      
      req.body.filters = processedFilters;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('seller', 'storeName email')
      .populate('category', 'name')
      .populate('filters', 'name description');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await invalidateFeaturedProductsCache();
    res.json(product);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          error: error.message 
        });
      }
      return res.status(500).json({ 
        message: 'Error updating product', 
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Error updating product', 
      error: 'An unexpected error occurred' 
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await invalidateFeaturedProductsCache();
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

// Search products with regex
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, seller, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = {};
    
    // Add search regex if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add seller filter if provided
    if (seller) {
      query.seller = seller;
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email')
        .populate('category', 'name')
        .populate('filters', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error });
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