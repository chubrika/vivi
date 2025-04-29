import { Order } from '../types/order';
import { useEffect, useState } from 'react';
import { useAuth } from '../utils/authContext';
import { API_BASE_URL } from '../utils/api';

interface OrderDetailsPanelProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

interface Courier {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function OrderDetailsPanel({ order, onClose, onStatusUpdate }: OrderDetailsPanelProps) {
  const { token, user } = useAuth();
  const isCourier = user?.role === 'courier';
  const isAdmin = user?.role === 'admin';
  const [couriers, setCouriers] = useState<Courier[]>([]);

  useEffect(() => {
    // Prevent body scrolling when panel is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCouriers();
    }
  }, [isAdmin]);

  const fetchCouriers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch couriers');
      }

      const data = await response.json();
      setCouriers(data);
    } catch (error) {
      console.error('Error fetching couriers:', error);
    }
  };

  const handleAssignCourier = async (courierId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${order?._id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courierId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign courier');
      }

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error assigning courier:', error);
    }
  };

  const handleRemoveCourier = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${order?._id}/assign`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove courier assignment');
      }

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error removing courier assignment:', error);
    }
  };

  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sellers/orders/${order._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full bg-white shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Details #{order.orderId}
            </h2>
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto h-[calc(100vh-4rem)]">
            {/* Order Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {(isCourier || isAdmin) && (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                    className="ml-2 block w-40 px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}
              </div>
            </div>

            {/* Courier Assignment (Admin only) */}
            {isAdmin && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Courier Assignment</h4>
                {order.courier ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">
                        {order.courier.firstName} {order.courier.lastName}
                      </span>
                      <button
                        onClick={handleRemoveCourier}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    onChange={(e) => handleAssignCourier(e.target.value)}
                    className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a courier</option>
                    {couriers.map((courier) => (
                      <option key={courier._id} value={courier._id}>
                        {courier.firstName} {courier.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Customer Information */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900">
                  {order.user.firstName} {order.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{order.user.email}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900">{order.shippingAddress}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {item.images && item.images[0] && (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                            )}
                            <span className="text-sm text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm text-gray-900">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Payment Status</span>
                  <span className="text-sm text-gray-900">
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Date */}
            <div className="text-sm text-gray-500">
              Ordered on {formatDate(order.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 