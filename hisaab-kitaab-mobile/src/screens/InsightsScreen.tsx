import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { getCategoryMeta } from '../theme/categoryColors';
import { BackendAPI } from '../services/api';
import { DonutChart } from '../components/DonutChart';
import { SpendingBar } from '../components/SpendingBar';
import { ErrorState } from '../components/ErrorState';
import { SkeletonLoader } from '../components/SkeletonLoader';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface CategorySummary { category: string; total: number; count: number; }
interface MonthlySummary {
  totalExpense: number; totalIncome: number;
  expenseCount: number; incomeCount: number;
  byCategory: CategorySummary[];
}
interface MerchantSummary { merchant: string; total: number; count: number; }

const formatCurrency = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

const savingsRate = (income: number, expense: number) => {
  if (income === 0) return 0;
  return Math.max(0, Math.min(100, ((income - expense) / income) * 100));
};

export const InsightsScreen = () => {
  const now = new Date();
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]     = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'merchants'>('categories');

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      const [s, m] = await Promise.all([
        BackendAPI.getMonthlySummary(year, month),
        BackendAPI.getTopMerchants(year, month, 8),
      ]);
      setSummary(s);
      setMerchants(m);
    } catch {
      setError(true);
    }
  }, [year, month]);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrent) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const donutSegments = (summary?.byCategory ?? []).map(cat => ({
    value: cat.total,
    color: getCategoryMeta(cat.category).color,
    label: getCategoryMeta(cat.category).label,
  }));
  const maxCategory = Math.max(...(summary?.byCategory ?? []).map(c => c.total), 1);
  const maxMerchant = Math.max(...merchants.map(m => m.total), 1);
  const totalExpense = summary?.totalExpense ?? 0;
  const totalIncome  = summary?.totalIncome ?? 0;
  const netSavings   = totalIncome - totalExpense;
  const sr           = savingsRate(totalIncome, totalExpense);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        {/* ── Page header ────────────────────────────────── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Insights</Text>
          <View style={styles.liveBadge}>
            <Ionicons name="analytics-outline" size={14} color={Colors.accent} />
          </View>
        </View>

        {/* ── Month Navigator ─────────────────────────────── */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.arrowBtn} onPress={prevMonth} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={styles.monthText}>{MONTH_NAMES[month - 1]}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>

          <TouchableOpacity
            style={[styles.arrowBtn, isCurrentMonth && styles.arrowBtnDisabled]}
            onPress={nextMonth}
            activeOpacity={0.7}
            disabled={isCurrentMonth}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isCurrentMonth ? Colors.textMuted : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          /* ── Loading skeleton ─────────────────────────── */
          <View style={{ gap: 12 }}>
            <SkeletonLoader width={180} height={180} borderRadius={90} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <SkeletonLoader height={16} borderRadius={6} />
            <SkeletonLoader width="70%" height={14} borderRadius={6} />
            <SkeletonLoader height={48} borderRadius={14} style={{ marginTop: 8 }} />
            <SkeletonLoader height={48} borderRadius={14} />
            <SkeletonLoader height={48} borderRadius={14} />
          </View>
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : (
          <>
            {/* ── Summary KPI strip ──────────────────────── */}
            <View style={styles.kpiRow}>
              <LinearGradient
                colors={['rgba(240,82,82,0.12)', 'rgba(240,82,82,0.04)']}
                style={styles.kpiCard}
              >
                <Ionicons name="trending-down" size={16} color={Colors.accentRed} />
                <Text style={[styles.kpiValue, { color: Colors.accentRed }]}>
                  {formatCurrency(totalExpense)}
                </Text>
                <Text style={styles.kpiLabel}>Spent</Text>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(31,216,143,0.12)', 'rgba(31,216,143,0.04)']}
                style={styles.kpiCard}
              >
                <Ionicons name="trending-up" size={16} color={Colors.accentGreen} />
                <Text style={[styles.kpiValue, { color: Colors.accentGreen }]}>
                  {formatCurrency(totalIncome)}
                </Text>
                <Text style={styles.kpiLabel}>Earned</Text>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(94,106,210,0.12)', 'rgba(94,106,210,0.04)']}
                style={styles.kpiCard}
              >
                <Ionicons name="wallet-outline" size={16} color={Colors.accent} />
                <Text style={[styles.kpiValue, {
                  color: netSavings >= 0 ? Colors.accentGreen : Colors.accentRed,
                }]}>
                  {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
                </Text>
                <Text style={styles.kpiLabel}>Net</Text>
              </LinearGradient>
            </View>

            {/* ── Savings rate meter ─────────────────────── */}
            {totalIncome > 0 && (
              <View style={styles.card}>
                <View style={styles.savingsHeader}>
                  <Text style={styles.cardTitle}>Savings Rate</Text>
                  <Text style={[styles.srPct, { color: sr >= 20 ? Colors.accentGreen : Colors.accentAmber }]}>
                    {sr.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.srTrack}>
                  <View style={[styles.srFill, {
                    width: `${sr}%`,
                    backgroundColor: sr >= 20 ? Colors.accentGreen : Colors.accentAmber,
                  }]} />
                </View>
                <Text style={styles.srHint}>
                  {sr >= 20
                    ? '✓ Great! You saved more than 20% this month.'
                    : sr > 0
                      ? '↑ Try to reach 20% savings for a healthy budget.'
                      : 'Your expenses exceeded your income this month.'}
                </Text>
              </View>
            )}

            {/* ── Donut chart card ───────────────────────── */}
            {donutSegments.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Spending by Category</Text>
                <View style={styles.donutRow}>
                  <DonutChart
                    segments={donutSegments}
                    total={totalExpense}
                    centerLabel={formatCurrency(totalExpense)}
                    centerSubLabel="spent"
                    size={176}
                    thickness={26}
                  />
                  <View style={styles.legend}>
                    {(summary?.byCategory ?? []).slice(0, 6).map(cat => {
                      const meta = getCategoryMeta(cat.category);
                      const pct  = totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(0) : '0';
                      return (
                        <View key={cat.category} style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: meta.color }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.legendLabel} numberOfLines={1}>{meta.label}</Text>
                            <Text style={styles.legendPct}>{pct}%</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* ── Breakdown tabs (Categories / Merchants) ── */}
            {donutSegments.length > 0 && (
              <View style={styles.card}>
                {/* Tab switcher */}
                <View style={styles.tabBar}>
                  <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'categories' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('categories')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabBtnText, activeTab === 'categories' && styles.tabBtnTextActive]}>
                      Categories
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'merchants' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('merchants')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabBtnText, activeTab === 'merchants' && styles.tabBtnTextActive]}>
                      Merchants
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'categories' ? (
                  (summary?.byCategory ?? []).length > 0 ? (
                    (summary?.byCategory ?? []).map(cat => {
                      const meta = getCategoryMeta(cat.category);
                      return (
                        <SpendingBar
                          key={cat.category}
                          label={meta.label}
                          amount={cat.total}
                          maxAmount={maxCategory}
                          color={meta.color}
                          count={cat.count}
                        />
                      );
                    })
                  ) : (
                    <Text style={styles.noTabData}>No category data</Text>
                  )
                ) : (
                  merchants.length > 0 ? (
                    merchants.map(m => (
                      <SpendingBar
                        key={m.merchant}
                        label={m.merchant ?? 'Unknown'}
                        amount={m.total}
                        maxAmount={maxMerchant}
                        color={Colors.accentPurple}
                        count={m.count}
                      />
                    ))
                  ) : (
                    <Text style={styles.noTabData}>No merchant data for this month</Text>
                  )
                )}
              </View>
            )}

            {/* ── Transaction count strip ────────────────── */}
            {(summary?.expenseCount ?? 0) + (summary?.incomeCount ?? 0) > 0 && (
              <View style={styles.countStrip}>
                <View style={styles.countItem}>
                  <Text style={styles.countNum}>{summary?.expenseCount ?? 0}</Text>
                  <Text style={styles.countLabel}>expense txns</Text>
                </View>
                <View style={styles.countDivider} />
                <View style={styles.countItem}>
                  <Text style={styles.countNum}>{summary?.incomeCount ?? 0}</Text>
                  <Text style={styles.countLabel}>income txns</Text>
                </View>
                <View style={styles.countDivider} />
                <View style={styles.countItem}>
                  <Text style={styles.countNum}>
                    {(summary?.expenseCount ?? 0) + (summary?.incomeCount ?? 0)}
                  </Text>
                  <Text style={styles.countLabel}>total</Text>
                </View>
              </View>
            )}

            {/* ── Empty state ────────────────────────────── */}
            {donutSegments.length === 0 && (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="bar-chart-outline" size={36} color={Colors.accent} />
                </View>
                <Text style={styles.emptyTitle}>No data for {MONTH_SHORT[month - 1]} {year}</Text>
                <Text style={styles.emptySub}>Sync your SMS or try a different month</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 120 },

  // ── Header
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle:  { ...Typography.headingLarge, color: Colors.textPrimary },
  liveBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderActive,
  },

  // ── Month nav
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: 16,
    paddingVertical: 4, paddingHorizontal: 4,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  arrowBtn: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  arrowBtnDisabled: { opacity: 0.25 },
  monthCenter: { alignItems: 'center' },
  monthText:   { ...Typography.headingSmall, color: Colors.textPrimary },
  yearText:    { ...Typography.bodySmall, color: Colors.textSecondary },

  // ── KPI strip
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  kpiValue: { ...Typography.headingSmall, letterSpacing: -0.3 },
  kpiLabel: { ...Typography.bodySmall, color: Colors.textSecondary },

  // ── Generic card
  card: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { ...Typography.headingSmall, color: Colors.textPrimary, marginBottom: 16 },

  // ── Savings rate
  savingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  srPct:    { ...Typography.headingMedium },
  srTrack:  { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHigh, overflow: 'hidden', marginBottom: 10 },
  srFill:   { height: 8, borderRadius: 4 },
  srHint:   { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 18 },

  // ── Donut
  donutRow:   { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend:     { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:  { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendLabel:{ ...Typography.bodySmall, color: Colors.textPrimary },
  legendPct:  { ...Typography.bodySmall, color: Colors.textSecondary },

  // ── Inner tabs
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.surfaceHigh,
    borderRadius: 10, padding: 3, marginBottom: 16, gap: 3,
  },
  tabBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.accentLight },
  tabBtnText: { ...Typography.labelMedium, color: Colors.textMuted },
  tabBtnTextActive: { color: Colors.accent },
  noTabData: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', paddingVertical: 16 },

  // ── Count strip
  countStrip: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 16,
  },
  countItem: { flex: 1, alignItems: 'center', gap: 3 },
  countNum:  { ...Typography.headingSmall, color: Colors.textPrimary },
  countLabel:{ ...Typography.bodySmall, color: Colors.textMuted },
  countDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 2 },

  // ── Empty
  emptyCard: { alignItems: 'center', padding: 56, gap: 12 },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.accentLight,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderActive,
  },
  emptyTitle: { ...Typography.headingSmall, color: Colors.textSecondary, textAlign: 'center' },
  emptySub:   { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
});
