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

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

// Debug environment variables (without exposing sensitive values)
console.log('Environment:', process.env.NODE_ENV);
console.log('Environment variables loaded from:', envFile);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://www.vivi.ge',
  'https://vivi.ge', // optional, for non-www
  'http://localhost:3000', // for development
  'http://localhost:3001', // for development alternative port
  'http://localhost:8081', // for Expo development server
  'http://127.0.0.1:3000', // for development
  'http://127.0.0.1:3001', // for development alternative port
  'http://127.0.0.1:8081', // for Expo development server
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Log all incoming requests for debugging
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('Allowing request with no origin');
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('Allowing request from:', origin);
      callback(null, true);
      return;
    }
    
    // Log blocked origins for debugging
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  // Log all requests for debugging
  console.log(`${req.method} ${req.path} from ${req.headers.origin}`);
  
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vivi';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

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

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the E-commerce API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 