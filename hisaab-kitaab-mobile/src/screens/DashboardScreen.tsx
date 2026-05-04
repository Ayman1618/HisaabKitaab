import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Platform,
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
  confidence?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  FOOD: 'restaurant',
  TRAVEL: 'car',
  SHOPPING: 'bag-handle',
  BILLS: 'receipt',
  ENTERTAINMENT: 'film',
  SALARY: 'briefcase',
  OTHER: 'ellipse',
};

const IS_EXPO_GO = !Platform.select({ android: true }) || (() => {
  try { require('react-native-get-sms-android'); return false; } catch { return true; }
})();

export const DashboardScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMode, setSyncMode] = useState<'real' | 'mock'>('real');

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await BackendAPI.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      console.error('[Dashboard] Fetch failed:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      let result: any;

      if (syncMode === 'mock' || IS_EXPO_GO) {
        result = await SmsService.syncMockTransactions();
        Alert.alert(
          '✅ Mock Sync Complete',
          `Sent ${result.count} sample bank SMS messages to the backend.\n\n` +
          (IS_EXPO_GO
            ? '⚠️  Expo Go cannot read real SMS. Build the app with `npx expo run:android` for real sync.'
            : 'Switch to Real Sync mode when testing on a device with actual bank SMS.'),
        );
      } else {
        result = await SmsService.syncTransactions();
        if (result.status === 'no_new_messages') {
          Alert.alert('📭 No New Messages', 'Your transactions are up to date!');
        } else {
          Alert.alert('✅ Sync Complete', `Processed ${result.count} new SMS messages.`);
        }
      }

      await fetchTransactions();
    } catch (err: any) {
      console.error('[Dashboard] Sync failed:', err.message);
      let message = 'Something went wrong. Please try again.';
      if (err.message?.includes('SMS_PERMISSION_DENIED')) {
        message = 'SMS permission was denied. Please grant it in Settings > Apps > HisaabKitaab > Permissions.';
      } else if (err.message?.includes('SMS_MODULE_UNAVAILABLE')) {
        message = 'SMS reading requires a Dev Build. Run `npx expo run:android` instead of Expo Go.';
      } else if (err.message?.includes('NETWORK') || err.message?.includes('timeout')) {
        message = 'Cannot reach the backend. Make sure your server is running and the IP in api.ts is correct.';
      }
      Alert.alert('Sync Failed', message);
    } finally {
      setSyncing(false);
    }
  };

  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentBlue} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>Demo User</Text>
          </View>
          <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
            {syncing
              ? <ActivityIndicator size="small" color={Colors.textPrimary} />
              : <Ionicons name="sync" size={22} color={Colors.textPrimary} />}
          </TouchableOpacity>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, syncMode === 'real' && styles.modeBtnActive]}
            onPress={() => setSyncMode('real')}
          >
            <Ionicons name="phone-portrait" size={13} color={syncMode === 'real' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.modeTxt, syncMode === 'real' && { color: '#fff' }]}> Real SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, syncMode === 'mock' && styles.modeBtnActive]}
            onPress={() => setSyncMode('mock')}
          >
            <Ionicons name="flask" size={13} color={syncMode === 'mock' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.modeTxt, syncMode === 'mock' && { color: '#fff' }]}> Mock Data</Text>
          </TouchableOpacity>
          {IS_EXPO_GO && (
            <View style={styles.expoGoBadge}>
              <Text style={styles.expoGoText}>Expo Go — Real SMS disabled</Text>
            </View>
          )}
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[Colors.accentBlue, Colors.accentPurple]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceTitle}>This Month's Spending</Text>
          <Text style={styles.balanceAmount}>₹ {totalExpense.toLocaleString('en-IN')}</Text>
          <View style={styles.incomeRow}>
            <Ionicons name="arrow-down-circle" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.incomeText}>  Income: ₹ {totalIncome.toLocaleString('en-IN')}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.accentBlue} style={{ marginTop: 40 }} />
        ) : transactions.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No transactions yet.</Text>
            <Text style={styles.emptySubText}>Tap the sync button to import bank SMS messages.</Text>
          </GlassCard>
        ) : (
          transactions.map((tx) => (
            <GlassCard key={tx.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View style={[
                    styles.iconWrapper,
                    { backgroundColor: tx.type === 'EXPENSE' ? 'rgba(255,59,48,0.15)' : 'rgba(50,215,75,0.15)' },
                  ]}>
                    <Ionicons
                      name={(CATEGORY_ICONS[tx.category] || 'ellipse') as any}
                      size={18}
                      color={tx.type === 'EXPENSE' ? Colors.accentRed : Colors.accentGreen}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle} numberOfLines={1}>{tx.merchant || 'Unknown'}</Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      {tx.confidence !== undefined && tx.confidence < 0.7 && (
                        <Text style={styles.lowConfidence}>  ⚠ Low confidence</Text>
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'EXPENSE' ? Colors.accentRed : Colors.accentGreen }]}>
                  {tx.type === 'EXPENSE' ? '−' : '+'} ₹{tx.amount.toLocaleString('en-IN')}
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
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingTop: 40, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4, fontWeight: '500' },
  name: { fontSize: 28, color: Colors.textPrimary, fontWeight: 'bold' },
  syncButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  modeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 8, flexWrap: 'wrap' },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  modeBtnActive: { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue },
  modeTxt: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  expoGoBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: 'rgba(255, 180, 0, 0.15)', borderWidth: 1, borderColor: 'rgba(255,180,0,0.4)',
  },
  expoGoText: { fontSize: 10, color: '#FFB400', fontWeight: '600' },
  balanceCard: { borderRadius: 24, padding: 24, marginBottom: 32 },
  balanceTitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8, fontWeight: '600' },
  balanceAmount: { fontSize: 38, color: '#fff', fontWeight: 'bold', marginBottom: 12 },
  incomeRow: { flexDirection: 'row', alignItems: 'center' },
  incomeText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12 },
  txCard: { paddingVertical: 8, marginBottom: 12 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  iconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  txDate: { fontSize: 12, color: Colors.textSecondary },
  lowConfidence: { fontSize: 11, color: '#FFB400' },
  txAmount: { fontSize: 15, fontWeight: 'bold' },
  emptyCard: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: Colors.textPrimary, fontSize: 17, fontWeight: '600' },
  emptySubText: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
});