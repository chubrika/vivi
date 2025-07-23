import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Order {
  id: string;
  status: 'Processing' | 'Delivered' | 'Cancelled';
  date: string;
  total: string;
}

// Temporary mock data
const mockOrders: Order[] = [
  { id: '1', status: 'Processing', date: '2024-05-01', total: '$99.99' },
  { id: '2', status: 'Delivered', date: '2024-04-28', total: '$149.99' },
  { id: '3', status: 'Cancelled', date: '2024-04-25', total: '$79.99' },
];

export default function OrdersScreen() {
  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.date}>Date: {item.date}</Text>
      <Text style={styles.total}>Total: {item.total}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>
      <FlatList
        data={mockOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'Processing':
      return '#FFA500';
    case 'Delivered':
      return '#4CAF50';
    case 'Cancelled':
      return '#FF0000';
    default:
      return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 20,
  },
  orderItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
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
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
}); 