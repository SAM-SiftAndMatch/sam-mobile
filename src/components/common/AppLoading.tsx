import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/colors';
export function AppLoading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator accessibilityLabel="Đang tải ứng dụng" color={COLORS.primary} />
    </View>
  );
}
