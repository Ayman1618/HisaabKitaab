import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { getCategoryMeta } from '../theme/categoryColors';
import { BackendAPI } from '../services/api';
import { FilterChip } from '../components/FilterChip';
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

const TYPE_FILTERS = [
  { key: 'All',     label: 'All',     color: Colors.accent },
  { key: 'Expense', label: 'Expense', color: Colors.accentRed },
  { key: 'Income',  label: 'Income',  color: Colors.accentGreen },
];

const CATEGORY_KEYS = ['FOOD', 'TRAVEL', 'SHOPPING', 'BILLS', 'ENTERTAINMENT', 'SALARY', 'OTHER'];

const formatCurrency = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

const groupDateLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
};

type ListItem = { type: 'header'; label: string } | { type: 'tx'; data: Transaction };

export const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered]         = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(false);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [catFilter, setCatFilter]       = useState('All');
  const [searchFocused, setSearchFocused] = useState(false);

  const searchAnim = useRef(new Animated.Value(0)).current;

  const fetchTransactions = useCallback(async () => {
    try {
      setError(false);
      const data = await BackendAPI.getTransactions({ limit: 200 });
      setTransactions(data);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  useEffect(() => {
    let result = [...transactions];
    if (typeFilter !== 'All') {
      result = result.filter(t => t.type === typeFilter.toUpperCase());
    }
    if (catFilter !== 'All') {
      result = result.filter(t => t.category === catFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(t =>
        (t.merchant ?? '').toLowerCase().includes(q) ||
        (t.category ?? '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [transactions, typeFilter, catFilter, search]);

  const onFocus = () => {
    setSearchFocused(true);
    Animated.timing(searchAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setSearchFocused(false);
    Animated.timing(searchAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Build grouped list with date headers
  const listItems: ListItem[] = [];
  let lastDate = '';
  filtered.forEach(tx => {
    const label = groupDateLabel(tx.transactionDate);
    if (label !== lastDate) {
      listItems.push({ type: 'header', label });
      lastDate = label;
    }
    listItems.push({ type: 'tx', data: tx });
  });

  const totalSpent  = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const totalEarned = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);

  const borderColor = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.borderActive],
  });

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{item.label}</Text>
          <View style={styles.dateHeaderLine} />
        </View>
      );
    }

    const tx  = item.data;
    const cat = getCategoryMeta(tx.category);
    return (
      <View style={styles.txItem}>
        <View style={[styles.txIcon, { backgroundColor: cat.bg }]}>
          <Ionicons name={cat.icon as any} size={18} color={cat.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txMerchant} numberOfLines={1}>
            {tx.merchant || cat.label}
          </Text>
          <View style={styles.txMeta}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
            </View>
            <Text style={styles.txDate}>{formatDate(tx.transactionDate)}</Text>
            {tx.confidence !== undefined && tx.confidence < 0.5 && (
              <View style={styles.lowConfBadge}>
                <Text style={styles.lowConfText}>⚠</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.txAmount, {
          color: tx.type === 'EXPENSE' ? Colors.accentRed : Colors.accentGreen,
        }]}>
          {tx.type === 'EXPENSE' ? '−' : '+'} {formatCurrency(tx.amount)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Sticky header area ──────────────────────────── */}
      <View style={styles.stickyHeader}>
        {/* Title + count */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Transactions</Text>
          {filtered.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filtered.length}</Text>
            </View>
          )}
        </View>

        {/* Search bar */}
        <Animated.View style={[styles.searchBar, { borderColor }]}>
          <Ionicons
            name="search"
            size={16}
            color={searchFocused ? Colors.accent : Colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchant or category…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onFocus={onFocus}
            onBlur={onBlur}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={17} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Type filters */}
        <View style={styles.typeRow}>
          {TYPE_FILTERS.map(f => (
            <FilterChip
              key={f.key}
              label={f.label}
              active={typeFilter === f.key}
              onPress={() => setTypeFilter(f.key)}
              color={f.color}
            />
          ))}
        </View>

        {/* Category filters scroll */}
        <FlatList
          data={CATEGORY_KEYS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i}
          contentContainerStyle={styles.catRow}
          style={{ flexGrow: 0 }}
          renderItem={({ item: k }) => {
            const meta = getCategoryMeta(k);
            return (
              <FilterChip
                label={meta.label}
                active={catFilter === k}
                onPress={() => setCatFilter(catFilter === k ? 'All' : k)}
                color={meta.color}
              />
            );
          }}
        />

        {/* Summary bar */}
        {filtered.length > 0 && !loading && (
          <View style={styles.summaryBar}>
            <Text style={styles.summaryCount}>
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.summaryAmounts}>
              {totalSpent > 0 && (
                <Text style={[styles.summaryAmt, { color: Colors.accentRed }]}>
                  −{formatCurrency(totalSpent)}
                </Text>
              )}
              {totalEarned > 0 && (
                <Text style={[styles.summaryAmt, { color: Colors.accentGreen }]}>
                  +{formatCurrency(totalEarned)}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* ── Content ─────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 8 }).map((_, i) => <TransactionSkeleton key={i} />)}
        </View>
      ) : error ? (
        <ErrorState onRetry={fetchTransactions} />
      ) : (
        <FlatList<ListItem>
          data={listItems}
          keyExtractor={(item, i) => item.type === 'header' ? `h-${item.label}` : item.data.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search-outline" size={32} color={Colors.accent} />
              </View>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>Try adjusting search or filters</Text>
              {(search || typeFilter !== 'All' || catFilter !== 'All') && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => { setSearch(''); setTypeFilter('All'); setCatFilter('All'); }}
                >
                  <Text style={styles.clearBtnText}>Clear all filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // ── Sticky header
  stickyHeader: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12,
  },
  pageTitle: { ...Typography.headingLarge, color: Colors.textPrimary },
  countBadge: {
    backgroundColor: Colors.accentLight, paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderActive,
  },
  countBadgeText: { ...Typography.labelSmall, color: Colors.accent, textTransform: 'none', fontSize: 12 },

  // ── Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14, marginHorizontal: 20, marginBottom: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1, ...Typography.bodyMedium,
    color: Colors.textPrimary, padding: 0,
  },

  // ── Filters
  typeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  catRow:  { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },

  // ── Summary bar
  summaryBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 9,
    backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  summaryCount: { ...Typography.labelMedium, color: Colors.textSecondary },
  summaryAmounts: { flexDirection: 'row', gap: 12 },
  summaryAmt: { ...Typography.labelMedium, fontFamily: 'Outfit_600SemiBold' },

  // ── Date group headers
  dateHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  dateHeaderText: { ...Typography.labelSmall, color: Colors.textMuted, flexShrink: 0 },
  dateHeaderLine: { flex: 1, height: 1, backgroundColor: Colors.divider },

  // ── Transaction items
  loadingContainer: { paddingTop: 8 },
  listContainer: { paddingBottom: 120 },
  txItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  txIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0,
  },
  txInfo: { flex: 1, marginRight: 10 },
  txMerchant: { ...Typography.labelLarge, color: Colors.textPrimary, marginBottom: 5 },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { ...Typography.bodySmall, fontFamily: 'Outfit_500Medium', fontSize: 11 },
  txDate: { ...Typography.bodySmall, color: Colors.textMuted },
  lowConfBadge: {
    backgroundColor: Colors.accentAmberLight, borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  lowConfText: { fontSize: 10, color: Colors.accentAmber },
  txAmount: { ...Typography.labelLarge, fontFamily: 'Outfit_600SemiBold', flexShrink: 0 },

  // ── Empty state
  emptyState: { alignItems: 'center', padding: 60, gap: 12 },
  emptyIconBg: {
    width: 70, height: 70, borderRadius: 20, backgroundColor: Colors.accentLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderActive,
  },
  emptyTitle: { ...Typography.headingSmall, color: Colors.textSecondary },
  emptySub: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
  clearBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.accentLight, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.accent,
  },
  clearBtnText: { ...Typography.labelMedium, color: Colors.accent },
});
