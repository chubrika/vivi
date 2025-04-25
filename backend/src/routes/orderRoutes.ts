import express from 'express';
import { auth } from '../middleware/auth';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import mongoose from 'mongoose';
import { IProduct } from '../models/Product';

const router = express.Router();

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    console.log('Creating order for user:', userId);
    console.log('Cart items:', cart.items);

    // Fetch complete product details for each cart item
    const cartItemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await mongoose.model('Product').findById(item.id);
        if (!product) {
          throw new Error(`Product not found: ${item.id}`);
        }
        return {
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          description: product.description,
          images: product.images || [], // Ensure we always have an array of images
          sellerId: product.seller.toString(),
          category: product.category,
          productFeatureValues: product.productFeatureValues
        };
      })
    );

    console.log('Cart items with details:', cartItemsWithDetails);

    // Calculate total amount
    const totalAmount = cartItemsWithDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('Total amount:', totalAmount);

    // Create new order with complete product details
    const order = new Order({
      user: userId,
      items: cartItemsWithDetails.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        images: item.images,
        sellerId: item.sellerId
      })),
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    console.log('Order before save:', order);

    // Save the order and wait for the pre-save middleware to complete
    try {
      const savedOrder = await order.save();
      console.log('Order saved successfully:', savedOrder);
      
      // Clear the cart after order is created
      cart.items = [];
      await cart.save();

      res.status(201).json({ 
        message: 'Order created successfully', 
        order: savedOrder 
      });
    } catch (saveError) {
      console.error('Error saving order:', saveError);
      return res.status(500).json({ 
        message: 'Error creating order', 
        error: saveError instanceof Error ? saveError.message : 'Unknown error',
        details: saveError
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error creating order', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const orderId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

export default router; 