import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  centerLabel?: string;
  centerSubLabel?: string;
  size?: number;
  thickness?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// A single animated arc segment
const ArcSegment = ({
  cx, cy, radius, circumference,
  dashArray, dashOffset,
  color, thickness, delay,
}: {
  cx: number; cy: number; radius: number; circumference: number;
  dashArray: number; dashOffset: number;
  color: string; thickness: number; delay: number;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [dashArray]);

  const animProps = useAnimatedProps(() => ({
    strokeDasharray: `${dashArray * progress.value} ${circumference}`,
    strokeDashoffset: dashOffset,
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={radius}
      stroke={color}
      strokeWidth={thickness}
      fill="none"
      strokeLinecap="round"
      animatedProps={animProps}
    />
  );
};

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  total,
  centerLabel,
  centerSubLabel,
  size = 180,
  thickness = 28,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0 || segments.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx} cy={cy} r={radius}
            stroke={Colors.surfaceHigh}
            strokeWidth={thickness}
            fill="none"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={styles.centerLabel}>₹0</Text>
          <Text style={styles.centerSub}>No data</Text>
        </View>
      </View>
    );
  }

  let cumulativePercent = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={Colors.surfaceHigh}
          strokeWidth={thickness}
          fill="none"
        />
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          {segments.map((seg, i) => {
            const pct       = seg.value / total;
            const dashArray = circumference * pct;
            const dashOffset = -circumference * cumulativePercent;
            cumulativePercent += pct;

            return (
              <ArcSegment
                key={i}
                cx={cx}
                cy={cy}
                radius={radius}
                circumference={circumference}
                dashArray={dashArray}
                dashOffset={dashOffset}
                color={seg.color}
                thickness={thickness}
                delay={i * 80}
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.center}>
        <Text style={styles.centerLabel} numberOfLines={1} adjustsFontSizeToFit>
          {centerLabel}
        </Text>
        <Text style={styles.centerSub}>{centerSubLabel ?? 'spent'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', paddingHorizontal: 8 },
  centerLabel: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  centerSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
