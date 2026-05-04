import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { getCategoryMeta } from '../theme/categoryColors';
import { BackendAPI } from '../services/api';
import { SmsService } from '../services/sms-service';
import { TransactionSkeleton } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';

interface Transaction {
  id: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME' | 'UNKNOWN';
  merchant?: string;
  category: string;
  transactionDate: string;
  confidence?: number;
}

const IS_EXPO_GO = (() => {
  try { require('react-native-get-sms-android'); return false; } catch { return true; }
})();

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatCurrency = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

export const HomeScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [syncing, setSyncing]           = useState(false);
  const [error, setError]               = useState(false);

  // Number counter animation for balance card
  const animValue = useRef(new Animated.Value(0)).current;

  const fetchTransactions = useCallback(async () => {
    try {
      setError(false);
      const data = await BackendAPI.getTransactions({ limit: 50 });
      setTransactions(data);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  // Animate balance figure on data load
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const totalIncome  = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, { toValue: 1, duration: 600, useNativeDriver: false }).start();
  }, [totalExpense]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      let result: any;
      if (IS_EXPO_GO) {
        result = await SmsService.syncMockTransactions();
        Alert.alert('✓ Mock Sync', `${result.count} sample transactions added.`);
      } else {
        result = await SmsService.syncTransactions();
        if (result.status === 'no_new_messages') {
          Alert.alert('✓ Up to date', 'No new bank messages found.');
        } else {
          Alert.alert('✓ Sync Complete', `Processed ${result.count} new messages.`);
        }
      }
      await fetchTransactions();
    } catch (err: any) {
      const msg = err.message ?? '';
      if (msg.includes('SMS_PERMISSION_DENIED'))
        Alert.alert('Permission Denied', 'Allow SMS access in Settings › Apps › HisaabKitaab › Permissions.');
      else if (msg.includes('NETWORK') || msg.includes('timeout'))
        Alert.alert('Network Error', 'Cannot reach backend. Check Wi-Fi & server.');
      else
        Alert.alert('Sync Failed', msg || 'An unexpected error occurred.');
    } finally {
      setSyncing(false);
    }
  };

  // Group recent transactions by date for section headers
  const recentTxns = transactions.slice(0, 10);

  // Category spending breakdown (top 4)
  const categoryMap: Record<string, number> = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const expenseCount = transactions.filter(t => t.type === 'EXPENSE').length;
  const incomeCount  = transactions.filter(t => t.type === 'INCOME').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.appName}>HisaabKitaab</Text>
          </View>
          <TouchableOpacity
            style={[styles.syncBtn, syncing && styles.syncBtnActive]}
            onPress={handleSync}
            disabled={syncing}
            activeOpacity={0.8}
          >
            {syncing
              ? <ActivityIndicator size="small" color={Colors.accent} />
              : <Ionicons name="sync-circle" size={26} color={Colors.accent} />}
          </TouchableOpacity>
        </View>

        {/* ── Balance card ───────────────────────────────── */}
        <LinearGradient
          colors={['#1E1456', '#0B0D17']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          {/* Decorative circles */}
          <View style={[styles.deco, { width: 200, height: 200, top: -60, right: -50, opacity: 0.06 }]} />
          <View style={[styles.deco, { width: 120, height: 120, bottom: -30, right: 80, opacity: 0.04 }]} />
          <View style={[styles.deco, { width: 80,  height: 80,  top: 20,   right: 140, opacity: 0.08 }]} />

          <View style={styles.balanceInner}>
            <Text style={styles.balanceLabel}>Total Spent</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(totalExpense)}</Text>

            {/* Income / Net row */}
            <View style={styles.balanceMetaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="arrow-down-circle" size={13} color={Colors.accentGreen} />
                <Text style={[styles.metaPillText, { color: Colors.accentGreen }]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              {netBalance !== 0 && (
                <View style={[styles.metaPill, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons
                    name={netBalance >= 0 ? 'trending-up' : 'trending-down'}
                    size={13}
                    color={netBalance >= 0 ? Colors.accentGreen : Colors.accentRed}
                  />
                  <Text style={[styles.metaPillText, {
                    color: netBalance >= 0 ? Colors.accentGreen : Colors.accentRed,
                  }]}>
                    Net {formatCurrency(Math.abs(netBalance))}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Accent bar */}
          <View style={styles.accentBar}>
            <LinearGradient
              colors={[Colors.accent, Colors.accentPurple]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.accentBarFill}
            />
          </View>
        </LinearGradient>

        {/* ── Quick stats ────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.accentRedLight }]}>
              <Ionicons name="trending-down" size={16} color={Colors.accentRed} />
            </View>
            <Text style={styles.statValue}>{expenseCount}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.accentGreenLight }]}>
              <Ionicons name="trending-up" size={16} color={Colors.accentGreen} />
            </View>
            <Text style={styles.statValue}>{incomeCount}</Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.accentLight }]}>
              <Ionicons name="receipt" size={16} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* ── Category quick view ────────────────────────── */}
        {!loading && topCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            <View style={styles.categoryGrid}>
              {topCategories.map(([cat, amount]) => {
                const meta = getCategoryMeta(cat);
                const pct  = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                return (
                  <View key={cat} style={styles.categoryCard}>
                    <View style={[styles.categoryIcon, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                    </View>
                    <Text style={styles.categoryLabel} numberOfLines={1}>{meta.label}</Text>
                    <Text style={[styles.categoryAmount, { color: meta.color }]}>
                      {formatCurrency(amount)}
                    </Text>
                    <Text style={styles.categoryPct}>{pct.toFixed(0)}%</Text>
                    {/* Mini bar */}
                    <View style={styles.categoryBar}>
                      <View style={[styles.categoryBarFill, {
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: meta.color,
                      }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Recent Activity ────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {!IS_EXPO_GO && (
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>

          <View style={styles.txCard}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TransactionSkeleton key={i} />)
            ) : error ? (
              <ErrorState
                title="Cannot reach backend"
                message="Start the server and pull to refresh."
                onRetry={fetchTransactions}
              />
            ) : recentTxns.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="receipt-outline" size={36} color={Colors.accent} />
                </View>
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySub}>
                  Tap the {IS_EXPO_GO ? 'mock' : ''}sync button to import your bank SMS
                </Text>
              </View>
            ) : (
              recentTxns.map((tx, idx) => {
                const cat = getCategoryMeta(tx.category);
                const isLast = idx === recentTxns.length - 1;
                return (
                  <View
                    key={tx.id}
                    style={[styles.txItem, !isLast && styles.txItemBorder]}
                  >
                    <View style={[styles.txIcon, { backgroundColor: cat.bg }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txMerchant} numberOfLines={1}>
                        {tx.merchant || cat.label}
                      </Text>
                      <View style={styles.txMetaRow}>
                        <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
                          <Text style={[styles.catBadgeText, { color: cat.color }]}>
                            {cat.label}
                          </Text>
                        </View>
                        <Text style={styles.txDate}>{formatDate(tx.transactionDate)}</Text>
                      </View>
                    </View>
                    <View style={styles.txAmountCol}>
                      <Text style={[styles.txAmount, {
                        color: tx.type === 'EXPENSE' ? Colors.accentRed : Colors.accentGreen,
                      }]}>
                        {tx.type === 'EXPENSE' ? '−' : '+'} {formatCurrency(tx.amount)}
                      </Text>
                      {tx.confidence !== undefined && tx.confidence < 0.5 && (
                        <Text style={styles.lowConf}>⚠ low</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Expo Go notice */}
        {IS_EXPO_GO && !loading && (
          <View style={styles.expoNotice}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.accentAmber} />
            <Text style={styles.expoNoticeText}>
              Expo Go mode — using mock data. Build with{' '}
              <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>npx expo run:android</Text> for real SMS.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 120 },

  // ── Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  greeting: { ...Typography.bodyMedium, color: Colors.textSecondary },
  appName:  { ...Typography.headingLarge, color: Colors.textPrimary, marginTop: 2 },
  syncBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  syncBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },

  // ── Balance card
  balanceCard: {
    borderRadius: 28, padding: 24, marginBottom: 16,
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(94,106,210,0.18)',
  },
  deco: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: Colors.accent,
  },
  balanceInner: { position: 'relative', zIndex: 1 },
  balanceLabel:  { ...Typography.labelMedium, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  balanceAmount: { ...Typography.displayMedium, color: Colors.textPrimary, marginBottom: 16 },
  balanceMetaRow: { flexDirection: 'row', gap: 10 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(31,216,143,0.1)',
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(31,216,143,0.2)',
  },
  metaPillText: { ...Typography.labelMedium },
  accentBar: {
    marginTop: 20, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  accentBarFill: { height: '100%', width: '65%' },

  // ── Quick stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 18,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 5,
  },
  statCardCenter: {},
  statIconBg: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  statValue: { ...Typography.headingSmall, color: Colors.textPrimary },
  statLabel: { ...Typography.bodySmall, color: Colors.textSecondary },

  // ── Section
  section:       { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { ...Typography.headingSmall, color: Colors.textPrimary },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(31,216,143,0.1)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(31,216,143,0.25)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accentGreen },
  liveText: { ...Typography.labelSmall, color: Colors.accentGreen, textTransform: 'none', fontSize: 10 },

  // ── Category grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '47.5%', backgroundColor: Colors.surface,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  categoryIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  categoryLabel:   { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 3 },
  categoryAmount:  { ...Typography.headingSmall, marginBottom: 2 },
  categoryPct:     { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: 8 },
  categoryBar:     { height: 4, borderRadius: 2, backgroundColor: Colors.surfaceHigh },
  categoryBarFill: { height: 4, borderRadius: 2 },

  // ── Transactions list
  txCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  txItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  txItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  txIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    flexShrink: 0,
  },
  txInfo: { flex: 1, marginRight: 8 },
  txMerchant: { ...Typography.labelLarge, color: Colors.textPrimary, marginBottom: 5 },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { ...Typography.bodySmall, fontFamily: 'Outfit_500Medium', fontSize: 11 },
  txDate: { ...Typography.bodySmall, color: Colors.textMuted },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { ...Typography.labelLarge, fontFamily: 'Outfit_600SemiBold' },
  lowConf: { ...Typography.bodySmall, color: Colors.accentAmber, fontSize: 10, marginTop: 2 },

  // ── Empty state
  emptyState: { padding: 48, alignItems: 'center', gap: 12 },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderActive,
  },
  emptyTitle: { ...Typography.headingSmall, color: Colors.textSecondary },
  emptySub:   { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },

  // ── Expo notice
  expoNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.accentAmberLight,
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
    marginTop: 4,
  },
  expoNoticeText: { ...Typography.bodySmall, color: Colors.accentAmber, flex: 1, lineHeight: 18 },
});
