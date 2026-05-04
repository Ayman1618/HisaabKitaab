import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface SpendingBarProps {
  label: string;
  amount: number;
  maxAmount: number;
  color: string;
  count?: number;
  delay?: number;
}

const formatAmount = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

export const SpendingBar: React.FC<SpendingBarProps> = ({
  label, amount, maxAmount, color, count, delay = 0,
}) => {
  const width = useSharedValue(0);
  const pct   = maxAmount > 0 ? Math.min(amount / maxAmount, 1) : 0;

  useEffect(() => {
    width.value = withDelay(
      delay,
      withSpring(pct, { damping: 18, stiffness: 120, mass: 0.8 }),
    );
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <View style={styles.right}>
          {count !== undefined && (
            <Text style={styles.count}>{count} txn{count !== 1 ? 's' : ''}</Text>
          )}
          <Text style={[styles.amount, { color }]}>{formatAmount(amount)}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, { backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1, marginRight: 8,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { ...Typography.bodySmall, color: Colors.textMuted },
  amount: { ...Typography.labelLarge, fontFamily: 'Outfit_600SemiBold' },
  track: {
    height: 6, borderRadius: 3,
    backgroundColor: Colors.surfaceHigh, overflow: 'hidden',
  },
  bar: { height: 6, borderRadius: 3 },
});
