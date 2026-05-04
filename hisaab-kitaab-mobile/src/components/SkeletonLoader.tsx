import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  delay?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  delay = 0,
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: 750 }),
          withTiming(0.3,  { duration: 750 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
};

export const TransactionSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <View style={styles.txSkeleton}>
    <SkeletonLoader width={44} height={44} borderRadius={14} delay={delay} />
    <View style={styles.txSkeletonText}>
      <SkeletonLoader width="62%" height={14} borderRadius={6} delay={delay} />
      <SkeletonLoader width="38%" height={11} borderRadius={5} delay={delay + 60} style={{ marginTop: 6 }} />
    </View>
    <SkeletonLoader width={72} height={14} borderRadius={6} delay={delay + 30} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: { backgroundColor: Colors.surfaceHigh },
  txSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  txSkeletonText: { flex: 1, gap: 6 },
});
