import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { courierService, CourierEarnings } from '../../services/courierService';
import { router } from 'expo-router';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState<CourierEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const data = await courierService.getEarnings();
      setEarnings(data);
      setError('');
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const handleWithdrawalRequest = async () => {
    try {
      await courierService.requestWithdrawal();
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
      // Refresh earnings to update pending withdrawal status
      await fetchEarnings();
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to request withdrawal');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'ჩარიცხული';
      case 'rejected':
        return 'უარყოფილი';
      default:
        return status;
    }
  };

  const renderPayoutItem = ({ item }: { item: CourierEarnings['payoutHistory'][0] }) => (
    <View style={styles.payoutCard}>
      <View style={styles.payoutHeader}>
        <Text style={styles.payoutAmount}>{item.amount} ₾</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.payoutDate}>{formatDate(item.date)}</Text>
    </View>
  );

  const renderDeliveryItem = ({ item }: { item: CourierEarnings['deliveryHistory'][0] }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.deliveryOrderId}>შეკვეთა #{item.orderId}</Text>
        <Text style={styles.deliveryAmount}>{item.totalAmount} ₾</Text>
      </View>
      <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryStatus}>სტატუსი: {item.status}</Text>
        <Text style={styles.deliveryDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>შემოსავლების ჩატვირთვა...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>შემოსავალი</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← უკან</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={[1]} // Single item to render the content
        renderItem={() => (
          <View style={styles.content}>
            {earnings && (
              <>
                {/* Earnings Summary */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryCards}>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryLabel}>შემოსავალი</Text>
                      <Text style={styles.summaryValue}>{earnings.totalEarnings} ₾</Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryLabel}>მიწოდებული შეკვეთები</Text>
                      <Text style={styles.summaryValue}>{earnings.totalDeliveries}</Text>
                    </View>
                  </View>
                </View>

                {/* Withdrawal Section */}
                <View style={styles.withdrawalContainer}>
                  {earnings.totalEarnings > 0 && !earnings.pendingWithdrawal && (
                    <TouchableOpacity
                      style={styles.withdrawalButton}
                      onPress={handleWithdrawalRequest}
                    >
                      <Text style={styles.withdrawalButtonText}>
                        გატანის მოთხოვნა ({earnings.totalEarnings} ₾)
                      </Text>
                    </TouchableOpacity>
                  )}
                  {earnings.pendingWithdrawal && (
                    <View style={styles.pendingWithdrawal}>
                      <Text style={styles.pendingWithdrawalText}>
                        გატანის მოთხოვნა მოლოდინშია
                      </Text>
                    </View>
                  )}
                  {earnings.totalEarnings === 0 && (
                    <Text style={styles.noEarningsText}>
                      შემოსავალი გატანისთვის არ გაქვთ
                    </Text>
                  )}
                </View>

                {/* Payout History */}
                <View style={styles.historyContainer}>
                  <Text style={styles.sectionTitle}>გატანის ისტორია</Text>
                  {earnings.payoutHistory.length > 0 ? (
                    <FlatList
                      data={earnings.payoutHistory}
                      renderItem={renderPayoutItem}
                      keyExtractor={(item, index) => `payout-${index}`}
                      scrollEnabled={false}
                      style={styles.historyList}
                    />
                  ) : (
                    <View style={styles.emptyHistory}>
                      <Text style={styles.emptyHistoryText}>გატანის ისტორია არ მოიძებნა</Text>
                    </View>
                  )}
                </View>

                {/* Delivery History */}
                <View style={styles.historyContainer}>
                  <Text style={styles.sectionTitle}>ბოლო მიწოდებები</Text>
                  {earnings.deliveryHistory.length > 0 ? (
                    <FlatList
                      data={earnings.deliveryHistory.slice(0, 10)} // Show only last 10
                      renderItem={renderDeliveryItem}
                      keyExtractor={(item) => item._id}
                      scrollEnabled={false}
                      style={styles.historyList}
                    />
                  ) : (
                    <View style={styles.emptyHistory}>
                      <Text style={styles.emptyHistoryText}>მიწოდების ისტორია არ მოიძებნა</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}
        keyExtractor={() => 'earnings-content'}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.earningsList}
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'sans-serif',
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
  earningsList: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  withdrawalContainer: {
    marginBottom: 24,
  },
  withdrawalButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  withdrawalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingWithdrawal: {
    backgroundColor: '#FFE5B4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pendingWithdrawalText: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: '600',
  },
  noEarningsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyList: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
  payoutCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  payoutDate: {
    fontSize: 14,
    color: '#666',
  },
  deliveryCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  deliveryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryStatus: {
    fontSize: 14,
    color: '#666',
  },
  deliveryDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyHistory: {
    padding: 20,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
}); 