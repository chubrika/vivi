import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { courierService, CourierStats } from '../../services/courierService';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const data = await courierService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching courier stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    try {
      await courierService.requestWithdrawal();
      // Refresh stats to update pending withdrawal status
      await fetchCourierStats();
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to request withdrawal');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {user?.role === 'courier' && stats && (
            <>
              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                  <StatCard 
                    title="სულ შეკვეთები" 
                    value={stats.totalOrders} 
                    icon="📦" 
                    color="#007AFF" 
                  />
                  <StatCard 
                    title="მიმდინარე შეკვეთები" 
                    value={stats.pendingOrders} 
                    icon="⏳" 
                    color="#FF9500" 
                  />
                  <StatCard 
                    title="დღის შეკვეთები" 
                    value={stats.todayOrders} 
                    icon="📅" 
                    color="#FF9500" 
                  />
                  <StatCard 
                    title="მიტანილი შეკვეთები" 
                    value={stats.deliveredOrders} 
                    icon="✅" 
                    color="#34C759" 
                  />
                  <StatCard 
                    title="გამოგზავნილი შეკვეთები" 
                    value={stats.shippedOrders} 
                    icon="🚚" 
                    color="#007AFF" 
                  />
                  <StatCard 
                    title="სულ შემოსავლები" 
                    value={`${stats.totalEarnings} ₾`} 
                    icon="💰" 
                    color="#34C759" 
                  />
                  <StatCard 
                    title="სულ მიტანები" 
                    value={stats.totalDeliveries} 
                    icon="🎯" 
                    color="#AF52DE" 
                  />
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
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
                      <Text style={styles.actionSubtitle}>View all orders</Text>
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
                      <Text style={styles.actionSubtitle}>Check earnings</Text>
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
                      <Text style={styles.actionSubtitle}>Update profile</Text>
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
            </>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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