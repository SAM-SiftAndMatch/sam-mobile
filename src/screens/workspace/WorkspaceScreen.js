import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../design/Text';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ConversationThread } from '../../components/chat/ProjectChatModal';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { COLORS } from '../../constants/colors';
export default function WorkspaceScreen({ route, navigation }) {
  const { conversations } = useApp();
  const { user } = useAuth();
  const [tab, setTab] = useState('Tin nhắn');
  const room = conversations.find(r => r.id === route.params?.roomId);
  if (!room) return <View style={styles.page}><Header title="Không gian dự án" showBack /><EmptyState title="Không tìm thấy hội thoại" message="Quay lại danh sách để chọn một dự án của bạn." /></View>;
  return <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
    <View style={styles.workspaceHeader}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Quay lại tin nhắn" onPress={navigation.goBack} style={styles.back}><Ionicons name="chevron-back" size={22} color={COLORS.primary} /></TouchableOpacity><Text style={styles.cardTitle}>Không gian dự án</Text></View>
    <View style={styles.tabs}>{['Tin nhắn', 'Tiến độ', 'Thỏa thuận'].map(label => <TouchableOpacity key={label} accessibilityRole="tab" accessibilityState={{ selected: tab === label }} style={[styles.tab, tab === label && styles.selected]} onPress={() => setTab(label)}><Text style={[styles.tabText, tab === label && { color: COLORS.primary }]}>{label}</Text></TouchableOpacity>)}</View>
    {tab === 'Tin nhắn' ? <ConversationThread embedded room={room} userId={user.id} onBack={navigation.goBack} onClose={navigation.goBack} /> : <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>KHÔNG GIAN DỰ ÁN</Text><Text style={styles.title}>{room.project.title}</Text><StatusBadge status={room.project.status} />
      <View style={styles.card}><Text style={styles.cardTitle}>{tab === 'Tiến độ' ? 'Tổng quan công việc' : 'Đề xuất đã xác nhận'}</Text><Text style={styles.label}>Báo giá</Text><Text style={styles.value}>{formatCurrency(room.application.proposedPrice, room.application.currency || room.project.currency)}</Text><Text style={styles.label}>Thời gian dự kiến</Text><Text style={styles.body}>{room.application.deliveryTime || 'Theo thỏa thuận'}</Text><Text style={styles.label}>Hạn dự án</Text><Text style={styles.body}>{formatDate(room.project.deadline)}</Text></View>
      {tab === 'Tiến độ' ? <View style={styles.card}><Text style={styles.cardTitle}>Timeline và bàn giao</Text><EmptyState icon="list-outline" title="Chưa có timeline" message="Dự án hiện tại chưa có dữ liệu timeline, báo cáo hay phiên bản bàn giao. Trao đổi với đối tác trong mục Tin nhắn." /></View> : <View style={styles.card}><Text style={styles.cardTitle}>Nội dung đề xuất</Text><Text style={styles.body}>{room.application.coverLetter || 'Chưa có nội dung bổ sung.'}</Text><Text style={styles.note}>Đây là thông tin đề xuất đã duyệt. Hợp đồng và trạng thái nạp tiền cần được đồng bộ từ hệ thống hợp đồng.</Text></View>}
    </ScrollView>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({ workspaceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white }, back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, page: { flex: 1, backgroundColor: COLORS.background }, tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white, paddingHorizontal: 12 }, tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' }, selected: { borderBottomColor: COLORS.primary }, tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted }, content: { padding: 20, gap: 16 }, eyebrow: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 1 }, title: { fontSize: 23, lineHeight: 32, fontWeight: '700', color: COLORS.textPrimary }, card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 16 }, cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }, label: { fontSize: 12, color: COLORS.textMuted, marginTop: 10 }, value: { fontSize: 22, fontWeight: '700', color: COLORS.primary, marginVertical: 4 }, body: { fontSize: 14, lineHeight: 23, color: COLORS.textPrimary, marginTop: 4 }, note: { fontSize: 12, lineHeight: 20, color: COLORS.textMuted, marginTop: 16 } });
