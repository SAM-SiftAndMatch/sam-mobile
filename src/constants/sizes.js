// Spacing, Typography Sizes, and Layout Constants
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SIZES = {
  // Global spacing
  base: 8,
  font: 14,
  radius: 12,
  radiusSm: 8,
  radiusLg: 20,
  radiusFull: 999,
  padding: 16,
  paddingSm: 10,
  paddingLg: 24,

  // Typography font sizes
  h1: 26,
  h2: 22,
  h3: 18,
  h4: 16,
  body1: 16,
  body2: 14,
  body3: 13,
  caption: 12,
  tiny: 10,

  // Screen dimensions
  width,
  height,
};

export const SHADOWS = {
  light: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  dark: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
