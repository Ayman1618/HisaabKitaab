import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress, color }) => {
  const activeColor = color ?? Colors.accent;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View
        style={[
          styles.chip,
          animStyle,
          active && {
            backgroundColor: activeColor + '20',
            borderColor: activeColor,
          },
        ]}
      >
        <Text style={[styles.label, active && { color: activeColor }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
});
