import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const TAB_CONFIG = [
  { name: 'Home',         icon: 'home',      iconOutline: 'home-outline',      label: 'Home' },
  { name: 'Insights',    icon: 'bar-chart', iconOutline: 'bar-chart-outline',  label: 'Insights' },
  { name: 'Transactions',icon: 'list',      iconOutline: 'list-outline',       label: 'Activity' },
  { name: 'Profile',     icon: 'person',    iconOutline: 'person-outline',     label: 'Profile' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabButton = ({
  config,
  isFocused,
  onPress,
}: {
  config: typeof TAB_CONFIG[number];
  isFocused: boolean;
  onPress: () => void;
}) => {
  const scale  = useSharedValue(1);
  const active = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    active.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: withTiming(active.value, { duration: 200 }),
    transform: [{ scaleX: withSpring(active.value, { damping: 14, stiffness: 200 }) }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.8, { damping: 8, stiffness: 350 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    onPress();
  };

  const activeColor   = Colors.accent;
  const inactiveColor = Colors.tabBarInactive;

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={config.label}
    >
      <View style={styles.tabInner}>
        {/* Active pill background */}
        <Animated.View style={[styles.activePill, pillStyle]} />

        {/* Icon */}
        <Animated.View style={iconStyle}>
          <Ionicons
            name={(isFocused ? config.icon : config.iconOutline) as any}
            size={22}
            color={isFocused ? activeColor : inactiveColor}
          />
        </Animated.View>

        {/* Label */}
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? activeColor : inactiveColor },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      {/* Top separator line with glow */}
      <View style={styles.topBorder} />
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const config    = TAB_CONFIG.find(t => t.name === route.name) ?? TAB_CONFIG[0];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={route.key}
              config={config}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 72,
    backgroundColor: 'rgba(11, 13, 23, 0.92)',
    overflow: 'hidden',
  },
  topBorder: {
    height: 1,
    backgroundColor: Colors.border,
  },
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 22 : 6,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 3,
    position: 'relative',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.borderActive,
  },
  tabLabel: {
    ...Typography.labelSmall,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
