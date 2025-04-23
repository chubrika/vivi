import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';
import Seller from '../models/Seller';

export const getStats = async (req: Request, res: Response) => {
  try {
    // Get counts
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const sellerCount = await Seller.countDocuments();
    const userCount = await User.countDocuments();

    // Get recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('seller', 'name')
      .populate('category', 'name')
      .select('name price stock seller category createdAt');

    // Get low stock products (less than 10 items)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .limit(5)
      .populate('seller', 'name')
      .select('name stock seller');

    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          categoryName: '$categoryInfo.name',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      counts: {
        products: productCount,
        categories: categoryCount,
        sellers: sellerCount,
        users: userCount
      },
      recentProducts,
      lowStockProducts,
      productsByCategory
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
}; 