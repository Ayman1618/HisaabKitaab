import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';
import { BackendAPI } from '../services/api';
import { SmsService } from '../services/sms-service';

interface Transaction {
  id: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME' | 'UNKNOWN';
  merchant?: string;
  category: string;
  transactionDate: string;
}

export const DashboardScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const data = await BackendAPI.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTransactions().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleSync = async () => {
    console.log('[DEBUG] Sync Clicked - FORCING SIMULATION MODE');
    setSyncing(true);
    try {
      // Bypassing real sync because Expo Go blocks the permission prompt
      console.log('[DEBUG] Running Simulation Sync...');
      const mockResult: any = await SmsService.syncMockTransactions();
      
      Alert.alert(
        'Success', 
        'Real SMS reading is disabled in Expo Go. Loaded 5 simulated bank transactions instead!'
      );
    } catch (err: any) {
      console.error('[DEBUG] Sync Error:', err.message);
      Alert.alert('Sync Failed', 'Could not connect to backend. Please check your terminal.');
    } finally {
      await fetchTransactions();
      setSyncing(false);
    }
  };

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentBlue} />}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.name}>Demo User</Text>
          </View>
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <Ionicons name="sync" size={24} color={Colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic Balance / Budget Representation */}
        <LinearGradient
          colors={[Colors.accentBlue, Colors.accentPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceTitle}>Total Spend (Synced)</Text>
          <Text style={styles.balanceAmount}>₹ {totalExpense.toLocaleString()}</Text>
          
          <View style={styles.budgetRow}>
            <Text style={styles.budgetSubtitle}>Based on SMS data</Text>
            <Ionicons name="checkmark-circle" size={16} color={Colors.textPrimary} />
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.accentBlue} style={{ marginTop: 40 }} />
        ) : transactions.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions found. Try Syncing!</Text>
          </GlassCard>
        ) : (
          transactions.map((tx) => (
            <GlassCard key={tx.id} style={styles.txCard}>
               <View style={styles.txRow}>
                  <View style={styles.txLeft}>
                     <View style={[
                       styles.iconWrapper, 
                       { backgroundColor: tx.type === 'EXPENSE' ? 'rgba(255, 59, 48, 0.15)' : 'rgba(50, 215, 75, 0.15)' }
                     ]}>
                        <Ionicons 
                          name={tx.type === 'EXPENSE' ? 'restaurant' : 'wallet'} 
                          size={18} 
                          color={tx.type === 'EXPENSE' ? Colors.accentRed : Colors.accentGreen} 
                        />
                     </View>
                     <View>
                       <Text style={styles.txTitle}>{tx.merchant || 'Unknown'}</Text>
                       <Text style={styles.txDate}>{new Date(tx.transactionDate).toLocaleDateString()}</Text>
                     </View>
                  </View>
                  <Text style={[
                      styles.txAmount, 
                      { color: tx.type === 'EXPENSE' ? Colors.textPrimary : Colors.accentGreen }
                    ]}>
                    {tx.type === 'EXPENSE' ? '-' : '+'} ₹ {tx.amount}
                  </Text>
               </View>
            </GlassCard>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  syncButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  balanceTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 40,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  budgetSubtitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  txCard: {
    paddingVertical: 8,
    marginBottom: 12
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  }
});
