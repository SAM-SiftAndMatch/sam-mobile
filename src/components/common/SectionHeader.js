import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const SectionHeader = ({ title, actionTitle, onAction, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionTitle && onAction && (
        <TouchableOpacity accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
    gap: 8,
  },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  title: {
    flex: 1,
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default SectionHeader;
