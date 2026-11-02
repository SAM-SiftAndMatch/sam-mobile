import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../design/Text';
import { STATUS_APPEARANCE } from '../../constants/statuses';
export function StatusBadge({ status = 'pending', label, style }) {
  const [title, backgroundColor, color] = STATUS_APPEARANCE[String(status).toUpperCase()] || ['Đang cập nhật', '#F1F5F9', '#475569'];
  return <View style={[styles.badge, { backgroundColor }, style]}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={[styles.text, { color }]}>{label || title}</Text></View>;
}
const styles = StyleSheet.create({ badge: { flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 1 }, dot: { width: 5, height: 5, borderRadius: 3 }, text: { fontSize: 11, fontWeight: '600', flexShrink: 1 } });
export default StatusBadge;
