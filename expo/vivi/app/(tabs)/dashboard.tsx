import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, Fragment } from 'react';
import { courierService, CourierStats } from '../../services/courierService';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  console.log('Dashboard: Rendering with user:', user);

  useEffect(() => {
    if (user?.role === 'courier') {
      fetchCourierStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCourierStats = async () => {
    try {
      console.log('Dashboard: Fetching courier stats...');
      setLoading(true);
      setError('');
      
      const data = await courierService.getStats();
      console.log('Dashboard: Received stats:', data);
      setStats(data);
    } catch (err) {
      console.error('Dashboard: Error fetching courier stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Set fallback stats to prevent crashes
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        todayOrders: 0,
        totalEarnings: 0,
        pendingWithdrawal: false,
        totalDeliveries: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchCourierStats();
    } else {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWithdrawalRequest = async () => {
    try {
      await courierService.requestWithdrawal();
      // Refresh stats to update pending withdrawal status
      await fetchCourierStats();
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
    } catch (err) {
      console.error('Dashboard: Error requesting withdrawal:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to request withdrawal');
    }
  };


  const StatCard = ({
    title,
    value,
    // icon,
    accentColor,
    highlight = false,
  }: {
    title: string;
    value: string | number;
    // icon: string;
    accentColor: string;
    highlight?: boolean;
  }) => (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <View style={[styles.statAccent, { backgroundColor: accentColor }]} />
      <View style={styles.statContent}>
        {/* <View style={[styles.statIconWrap, { backgroundColor: `${accentColor}20` }]}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View> */}
        <Text style={[styles.statValue, highlight && styles.statValueLarge]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.emailText}>{user?.email || 'No email available'}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>გამარჯობა, {user?.name ? user.name : 'მომხმარებელი'}!</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {user?.role === 'courier' && stats !== null && (
            <Fragment>
              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                {/* Earnings Banner */}
                <View style={styles.earningsBanner}>
                  <Text style={styles.earningsLabel}>სულ შემოსავლები</Text>
                  <Text style={styles.earningsValue}>{stats.totalEarnings} ₾</Text>
                </View>

                <View style={styles.statsHeader}>
                  <Text style={styles.sectionTitle}>შეკვეთები</Text>
                  <Text style={styles.sectionSubtitle}>ბოლო 30 დღე</Text>
                </View>

                <View style={styles.statsHighlights}>
                  <StatCard
                    title="შეკვეთები"
                    value={stats.totalOrders}
                    // icon="📦"
                    accentColor="#007AFF"
                    highlight
                  />
                </View>

                <View style={styles.statsGrid}>
                  <StatCard
                    title="მიმდინარე"
                    value={stats.pendingOrders}
                    // icon="⏳"
                    accentColor="#FF9500"
                  />
                  <StatCard
                    title="დღის"
                    value={stats.todayOrders}
                    // icon="📅"
                    accentColor="#AF52DE"
                  />
                  <StatCard
                    title="მიტანილი"
                    value={stats.deliveredOrders}
                    // icon="✅"
                    accentColor="#34C759"
                  />
                  <StatCard
                    title="გამოგზავნილი"
                    value={stats.shippedOrders}
                    // icon="🚚"
                    accentColor="#007AFF"
                  />
                  <StatCard
                    title="შეუსრულებელი"
                    value={stats.processingOrders}
                    // icon="🔄"
                    accentColor="#FF3B30"
                  />
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>ქმედებები</Text>
                <View style={styles.quickActionsGrid}>
                  <View style={styles.actionCard}>
                    <View style={[styles.actionIcon, { backgroundColor: '#007AFF' }]}>
                      <Text style={styles.actionIconText}>📦</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => router.push('/orders')}
                    >
                      <Text style={styles.actionTitle}>ყველა შეკვეთა</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.actionCard}>
                    <View style={[styles.actionIcon, { backgroundColor: '#34C759' }]}>
                      <Text style={styles.actionIconText}>💰</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => router.push('/earnings')}
                    >
                      <Text style={styles.actionTitle}>შემოსავლების ნახვა</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.actionCard}>
                    <View style={[styles.actionIcon, { backgroundColor: '#FF9500' }]}>
                      <Text style={styles.actionIconText}>👤</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => router.push('/profile')}
                    >
                      <Text style={styles.actionTitle}>პროფილის განახლება</Text>
                    </TouchableOpacity>
                  </View>

                  {stats.totalEarnings > 0 && !stats.pendingWithdrawal && (
                    <View style={styles.actionCard}>
                      <View style={[styles.actionIcon, { backgroundColor: '#FF3B30' }]}>
                        <Text style={styles.actionIconText}>💳</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={handleWithdrawalRequest}
                      >
                        <Text style={styles.actionTitle}>გატანის მოთხოვნა</Text>
                        <Text style={styles.actionSubtitle}>{stats.totalEarnings} ₾</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {stats.pendingWithdrawal && (
                    <View style={styles.actionCard}>
                      <View style={[styles.actionIcon, { backgroundColor: '#FFE5B4' }]}>
                        <Text style={styles.actionIconText}>⏳</Text>
                      </View>
                      <View style={styles.actionButton}>
                        <Text style={[styles.actionTitle, { color: '#FF9500' }]}>გატანის მოთხოვნის მოლოდინში</Text>
                        <Text style={[styles.actionSubtitle, { color: '#FF9500' }]}>Request pending</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.recentActivityContainer}>
                <Text style={styles.sectionTitle}>ბოლო მოქმედებები</Text>
                <View style={styles.activityPlaceholder}>
                  <Text style={styles.activityText}>ბოლო მოქმედებები ვერ მოიძებნა.</Text>
                </View>
              </View>
            </Fragment>
          )}

          {user?.role !== 'courier' && (
            <View style={styles.regularUserContainer}>
              <Text style={styles.regularUserText}>მოგესალმებათ, vivi.ge!</Text>
              <Text style={styles.regularUserSubtext}>
                ეს აპი კურიერებისთვისაა დაწერილი. თუ გჭირდებათ დახმარება, დაგვიკავშირდით.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
  },
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
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statsContainer: {
    marginBottom: 24,
  },
  earningsBanner: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(52, 199, 89, 0.3)',
      },
      default: {
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  earningsLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  statsHighlights: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    borderRadius: 18,
    padding: 18,
    width: '48%',
    minHeight: 100,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  statCardHighlight: {
    flex: 1,
    width: undefined,
  },
  statAccent: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statIconWrap: {
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  statValueLarge: {
    fontSize: 26,
  },
  statTitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconText: {
    fontSize: 20,
  },
  actionButton: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  activityPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
  activityText: {
    color: '#999',
    fontSize: 14,
  },
  regularUserContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
  regularUserText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  regularUserSubtext: {
    fontSize: 14,
    color: '#666',
  },
}); 