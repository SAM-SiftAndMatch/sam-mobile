import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const LoadingState = ({ message = 'Loading marketplace data...', style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.paddingLg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  text: {
    marginTop: 12,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default LoadingState;
