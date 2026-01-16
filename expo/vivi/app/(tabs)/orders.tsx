import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { orderService, Order, OrderFilters } from '../../services/orderService';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(filters);
      setOrders(response.orders);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', 'Order status updated successfully!');
      // Refresh orders to show updated status
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrders[item._id];

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          activeOpacity={0.8}
          onPress={() => toggleOrderExpansion(item._id)}
        >
          <View>
            <Text style={styles.orderId}>#{item.orderId}</Text>
            <Text style={styles.orderDateSmall}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={styles.orderDetails}>
              <Text style={styles.customerName}>
                {item.user.firstName} {item.user.lastName}
              </Text>
              <Text style={styles.customerEmail}>{item.user.email}</Text>
              <Text style={styles.shippingAddress}>📍 {item.shippingAddress}</Text>
              <Text style={styles.totalAmount}>სულ: {item.totalAmount} ₾</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.orderItems}>
              <Text style={styles.itemsTitle}>პროდუქტები ({item.items.length}):</Text>
              {item.items.slice(0, 3).map((orderItem, index) => (
                <Text key={index} style={styles.itemText}>
                  • {orderItem.name} x{orderItem.quantity}
                </Text>
              ))}
              {item.items.length > 3 && (
                <Text style={styles.moreItems}>{`+${item.items.length - 3} more items`}</Text>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  const orderData = encodeURIComponent(JSON.stringify(item));
                  router.push(`/order-details/${item._id}?orderData=${orderData}`);
                }}
              >
                <Text style={styles.actionButtonText}>დეტალურად</Text>
              </TouchableOpacity>

              {item.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                  onPress={() => updateOrderStatus(item._id, 'processing')}
                >
                  <Text style={styles.actionButtonText}>პროცესშია</Text>
                </TouchableOpacity>
              )}

              {item.status === 'processing' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#5856D6' }]}
                  onPress={() => updateOrderStatus(item._id, 'shipped')}
                >
                  <Text style={styles.actionButtonText}>გაგზავნილია</Text>
                </TouchableOpacity>
              )}

              {item.status === 'shipped' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                  onPress={() => updateOrderStatus(item._id, 'delivered')}
                >
                  <Text style={styles.actionButtonText}>მიწოდებულია</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  const FilterButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>შეკვეთების ჩატვირთვა...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>შეკვეთები</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← უკან</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton
          title="ყველა"
          active={!filters.status}
          onPress={() => setFilters({ ...filters, status: undefined, page: 1 })}
        />
        <FilterButton
          title="მოლოდინშია"
          active={filters.status === 'pending'}
          onPress={() => setFilters({ ...filters, status: 'pending', page: 1 })}
        />
        <FilterButton
          title="პროცესშია"
          active={filters.status === 'processing'}
          onPress={() => setFilters({ ...filters, status: 'processing', page: 1 })}
        />
        <FilterButton
          title="გაგზავნილია"
          active={filters.status === 'shipped'}
          onPress={() => setFilters({ ...filters, status: 'shipped', page: 1 })}
        />
        <FilterButton
          title="მიწოდებულია"
          active={filters.status === 'delivered'}
          onPress={() => setFilters({ ...filters, status: 'delivered', page: 1 })}
        />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>შეკვეთები არ მოიძებნა</Text>
            <Text style={styles.emptySubtext}>
              {filters.status ? `No ${filters.status} orders` : 'შეყვეთები არ მოიძებნა'}
            </Text>
          </View>
        }
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
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    margin: 20,
    padding: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f1f3f4',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDateSmall: {
    fontSize: 12,
    color: '#999',
  },
  chevronIcon: {
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  shippingAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderItems: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
}); 