import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const StatusBadge = ({ status = 'pending', label, style }) => {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'accepted':
      case 'active':
      case 'in_progress':
        return { bg: COLORS.successBg, text: COLORS.success, border: COLORS.secondaryLight };
      case 'pending':
      case 'draft':
        return { bg: COLORS.warningBg, text: COLORS.warning, border: COLORS.accentLight };
      case 'rejected':
      case 'closed':
        return { bg: COLORS.dangerBg, text: COLORS.danger, border: '#FCA5A5' };
      default:
        return { bg: COLORS.surface, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const badgeConfig = getBadgeStyle();
  const labels = { open: 'Đang tuyển', in_progress: 'Đang thực hiện', pending: 'Chờ duyệt', accepted: 'Đã duyệt', rejected: 'Đã từ chối', draft: 'Bản nháp', completed: 'Hoàn thành', closed: 'Đã đóng', active: 'Đang hoạt động' };
  const displayLabel = label || labels[status] || status;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeConfig.bg, borderColor: badgeConfig.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: badgeConfig.text }]}>{displayLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatusBadge;
