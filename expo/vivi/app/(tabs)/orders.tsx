import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { orderService, Order, OrderFilters } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';

interface OrderDetailsModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  visible,
  order,
  onClose,
  onStatusUpdate,
}) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus);
      Alert.alert('Success', 'Order status updated successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'processing':
        return '#007AFF';
      case 'shipped':
        return '#5856D6';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

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

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Order Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Order Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>#{order.orderId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.infoValue}>${order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>
                {order.user.firstName} {order.user.lastName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{order.user.email}</Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Status Update */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusButtons}>
              {['processing', 'shipped', 'delivered'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    order.status === status && styles.activeStatusButton,
                  ]}
                  onPress={() => handleStatusUpdate(status as Order['status'])}
                  disabled={updating || order.status === status}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      order.status === status && styles.activeStatusButtonText,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [searchOrderId, setSearchOrderId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const statuses = ['processing', 'shipped', 'delivered'];

  const clearFilters = () => {
    setSearchOrderId('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchOrderId || selectedStatus || startDate || endDate;

  useEffect(() => {
    fetchOrders(true);
  }, [currentPage, searchOrderId, selectedStatus, startDate, endDate]);

  const fetchOrders = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      }
      setError('');

      const filters: OrderFilters = {
        page: reset ? 1 : currentPage,
        limit: 10,
        ...(searchOrderId && { orderId: searchOrderId }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const response = await orderService.getOrders(filters);
      
      if (reset) {
        setOrders(response.orders);
      } else {
        setOrders(prev => [...prev, ...response.orders]);
      }
      
      setTotalPages(response.pagination.totalPages);
      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      // Update the order in the list
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      throw error;
    }
  };

  const getStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'processing':
        return '#007AFF';
      case 'shipped':
        return '#5856D6';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

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

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.orderId}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Text style={styles.customerEmail}>{item.user.email}</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.itemsCount}>
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.total}>${item.totalAmount.toFixed(2)}</Text>
      </View>
      
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filters</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#007AFF" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterInputs}>
        <TextInput
          style={styles.filterInput}
          placeholder="Search Order ID"
          value={searchOrderId}
          onChangeText={setSearchOrderId}
        />
        
        <View style={styles.statusFilter}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterButton,
                selectedStatus === status && styles.activeStatusFilterButton,
              ]}
              onPress={() => setSelectedStatus(selectedStatus === status ? '' : status)}
            >
              <Text
                style={[
                  styles.statusFilterButtonText,
                  selectedStatus === status && styles.activeStatusFilterButtonText,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Manage your deliveries</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {renderFilterSection()}

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySubtitle}>
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Orders will appear here when available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
                     ListFooterComponent={
             hasMore ? (
               <View style={styles.loadMoreContainer}>
                 <ActivityIndicator size="small" color="#007AFF" />
                 <Text style={styles.loadMoreText}>Loading more...</Text>
               </View>
             ) : null
           }
        />
      )}

      <OrderDetailsModal
        visible={selectedOrder !== null}
        order={selectedOrder}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  filterSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterInputs: {
    gap: 12,
  },
  filterInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  statusFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  statusFilterButton: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeStatusFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusFilterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeStatusFilterButtonText: {
    color: '#fff',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeStatusButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeStatusButtonText: {
    color: '#fff',
  },
}); 