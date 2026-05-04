import { TextStyle } from 'react-native';

export const Typography = {
  displayLarge: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  } as TextStyle,

  displayMedium: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  } as TextStyle,

  headingLarge: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  } as TextStyle,

  headingMedium: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  } as TextStyle,

  headingSmall: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 17,
    lineHeight: 24,
  } as TextStyle,

  bodyLarge: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    lineHeight: 18,
  } as TextStyle,

  labelLarge: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  labelMedium: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,

  labelSmall: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,

  mono: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.3,
  } as TextStyle,
};
