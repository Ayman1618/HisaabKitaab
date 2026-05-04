import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const INFO_ROWS = [
  { icon: 'person-circle-outline', label: 'User ID',     value: 'demo-user-1' },
  { icon: 'server-outline',        label: 'Backend',      value: 'NestJS + PostgreSQL' },
  { icon: 'phone-portrait-outline',label: 'SMS Reader',   value: 'react-native-get-sms-android' },
  { icon: 'code-slash-outline',    label: 'Frontend',     value: 'Expo + React Native' },
];

const PHASE_ITEMS = [
  { done: true,  label: 'Multi-screen navigation (Bottom tabs)' },
  { done: true,  label: 'Premium design system (Outfit font, indigo accent)' },
  { done: true,  label: 'Insights: Donut chart, spending bars, merchants' },
  { done: true,  label: 'Transactions: Search, filters, grouped by date' },
  { done: true,  label: 'Skeleton loaders + pull-to-refresh' },
  { done: true,  label: 'Offline error state + retry' },
  { done: false, label: 'Auth (Firebase / Supabase) — Phase 2' },
  { done: false, label: 'Real AI parsing (Gemini) — Phase 2' },
  { done: false, label: 'Background SMS sync — Phase 2' },
];

export const ProfileScreen = () => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Avatar header ──────────────────────────────── */}
      <LinearGradient
        colors={['#1E1456', '#0B0D17']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Decorative circles */}
        <View style={[styles.deco, { width: 140, height: 140, top: -40, right: -30, opacity: 0.06 }]} />
        <View style={[styles.deco, { width: 80,  height: 80,  bottom: 10, right: 100, opacity: 0.05 }]} />

        <View style={styles.avatarRing}>
          <LinearGradient
            colors={[Colors.accent, Colors.accentPurple]}
            style={styles.avatarGradient}
          >
            <Ionicons name="person" size={36} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.heroName}>Demo User</Text>
        <Text style={styles.heroSub}>demo-user-1</Text>

        <View style={styles.heroBadge}>
          <View style={styles.heroBadgeDot} />
          <Text style={styles.heroBadgeText}>Phase 1 — Live</Text>
        </View>
      </LinearGradient>

      {/* ── App info rows ──────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Info</Text>
        {INFO_ROWS.map(r => (
          <View key={r.label} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name={r.icon as any} size={18} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{r.label}</Text>
              <Text style={styles.infoValue}>{r.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Phase 1 checklist ─────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Phase 1 Roadmap</Text>
        {PHASE_ITEMS.map((item, idx) => (
          <View key={idx} style={styles.phaseRow}>
            <View style={[
              styles.phaseCheck,
              { backgroundColor: item.done ? Colors.accentGreenLight : Colors.surfaceHigh },
            ]}>
              <Ionicons
                name={item.done ? 'checkmark' : 'time-outline'}
                size={13}
                color={item.done ? Colors.accentGreen : Colors.textMuted}
              />
            </View>
            <Text style={[
              styles.phaseLabel,
              { color: item.done ? Colors.textPrimary : Colors.textMuted },
            ]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Phase 2 teaser ────────────────────────────── */}
      <View style={[styles.card, styles.phase2Card]}>
        <View style={styles.phase2Header}>
          <Ionicons name="rocket-outline" size={20} color={Colors.accentPurple} />
          <Text style={[styles.cardTitle, { color: Colors.accentPurple, marginBottom: 0 }]}>
            Phase 2 — Coming Soon
          </Text>
        </View>
        <Text style={styles.phase2Text}>
          Firebase Auth, Gemini AI parsing, background SMS sync, cloud backup, and multi-device support.
        </Text>
      </View>

      {/* ── Version footer ─────────────────────────────── */}
      <Text style={styles.version}>HisaabKitaab v1.0.0 · Phase 1</Text>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 120 },

  // ── Hero
  hero: {
    borderRadius: 24, padding: 28, alignItems: 'center',
    marginBottom: 16, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(94,106,210,0.18)',
  },
  deco: { position: 'absolute', borderRadius: 999, backgroundColor: Colors.accent },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    padding: 3, backgroundColor: 'rgba(94,106,210,0.25)',
    marginBottom: 14,
  },
  avatarGradient: {
    flex: 1, borderRadius: 42,
    justifyContent: 'center', alignItems: 'center',
  },
  heroName:  { ...Typography.headingMedium, color: Colors.textPrimary, marginBottom: 4 },
  heroSub:   { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: 16 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.borderActive,
  },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accentGreen },
  heroBadgeText: { ...Typography.labelSmall, color: Colors.accent, textTransform: 'none', fontSize: 12 },

  // ── Cards
  card: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { ...Typography.headingSmall, color: Colors.textPrimary, marginBottom: 16 },

  // ── Info rows
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.accentLight,
    justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 2 },
  infoValue: { ...Typography.labelLarge, color: Colors.textPrimary },

  // ── Phase checklist
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  phaseCheck: {
    width: 26, height: 26, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  phaseLabel: { ...Typography.bodyMedium, flex: 1 },

  // ── Phase 2 card
  phase2Card: { borderColor: 'rgba(155,89,245,0.2)', backgroundColor: 'rgba(155,89,245,0.05)' },
  phase2Header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  phase2Text: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 22 },

  // ── Version
  version: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
});
