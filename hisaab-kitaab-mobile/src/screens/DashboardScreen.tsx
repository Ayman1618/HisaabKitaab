import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';

export const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.name}>Ayman</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
             <Ionicons name="person" size={20} color={Colors.textPrimary} />
          </View>
        </View>

        {/* Dynamic Balance / Budget Representation */}
        <LinearGradient
          colors={[Colors.accentBlue, Colors.accentPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceTitle}>Total Spend (This Month)</Text>
          <Text style={styles.balanceAmount}>₹ 12,450</Text>
          
          <View style={styles.budgetRow}>
            <Text style={styles.budgetSubtitle}>70% of budget reached</Text>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.textPrimary} />
          </View>
        </LinearGradient>

        {/* AI Insight Highlight */}
        <Text style={styles.sectionTitle}>AI Insight</Text>
        <GlassCard>
          <View style={styles.insightRow}>
             <Ionicons name="sparkles" size={24} color={Colors.accentGreen} />
             <Text style={styles.insightText}>
               You spent 25% more on food this week! Try cooking at home to save ₹2000.
             </Text>
          </View>
        </GlassCard>

        {/* Recent Transactions List via GlassCards */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        <GlassCard style={styles.txCard}>
           <View style={styles.txRow}>
              <View style={styles.txLeft}>
                 <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                    <Ionicons name="restaurant" size={18} color={Colors.accentRed} />
                 </View>
                 <View>
                   <Text style={styles.txTitle}>Zomato</Text>
                   <Text style={styles.txDate}>Today, 12:45 PM</Text>
                 </View>
              </View>
              <Text style={[styles.txAmount, { color: Colors.textPrimary }]}>- ₹ 450</Text>
           </View>
        </GlassCard>

        <GlassCard style={styles.txCard}>
           <View style={styles.txRow}>
              <View style={styles.txLeft}>
                 <View style={[styles.iconWrapper, { backgroundColor: 'rgba(50, 215, 75, 0.15)' }]}>
                    <Ionicons name="wallet" size={18} color={Colors.accentGreen} />
                 </View>
                 <View>
                   <Text style={styles.txTitle}>Salary Credit</Text>
                   <Text style={styles.txDate}>Yesterday</Text>
                 </View>
              </View>
              <Text style={[styles.txAmount, { color: Colors.accentGreen }]}>+ ₹ 55,000</Text>
           </View>
        </GlassCard>

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
  avatarPlaceholder: {
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
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  txCard: {
    paddingVertical: 4, // reduce default padding from GlassCard wrapper
    marginBottom: 0
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
  }
});
