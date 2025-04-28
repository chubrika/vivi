export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  sellerId: string;
}

export interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
} 