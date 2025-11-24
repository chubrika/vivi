import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import componentRoutes from './routes/components';
import sellerRoutes from './routes/sellerRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import addressRoutes from './routes/addressRoutes';
import filterRoutes from './routes/filterRoutes';
import adminRoutes from './routes/adminRoutes';
import orderRoutes from './routes/orderRoutes';
import courierRoutes from './routes/courierRoutes';
import widgetGroupRoutes from './routes/widgetGroup.routes';
import homeSliderRoutes from './routes/homeSliderRoutes';

// Load environment variables
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

// Debugging only
console.log('Environment:', process.env.NODE_ENV);
console.log('Loaded env:', envFile);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

if (!process.env.JWT_SECRET) {
  console.warn(
    'WARNING: JWT_SECRET is not defined in environment variables.'
  );
}

const app = express();

// Allowed origins for web browsers
const allowedOrigins = [
  'https://www.vivi.ge',
  'https://vivi.ge',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:8081',
];

// CORS configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allowed?: boolean) => void
  ) {
    console.log('CORS request from:', origin);

    // Mobile apps, curl, Postman, server-to-server => no origin header
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Allow local network dev IPs
    if (
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
      origin.startsWith('http://127.') ||
      origin.startsWith('http://localhost')
    ) {
      callback(null, true);
      return;
    }

    console.log('CORS BLOCKED:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/vivi';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/widget-groups', widgetGroupRoutes);
app.use('/api/home-sliders', homeSliderRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the E-commerce API' });
});

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`);
  console.log(` - http://localhost:${PORT}`);
  console.log(` - http://0.0.0.0:${PORT}`);
});
