import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Text from '../../design/Text';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { conversationPeer, conversationUnread } from '../../services/projectChatStore';
import { COLORS } from '../../constants/colors';
export default function MessagesScreen({ navigation }) {
  const { user } = useAuth();
  const { conversations, refreshConversations } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const refresh = async () => { setRefreshing(true); setError(''); try { await refreshConversations(); } catch { setError('Không tải được hội thoại.'); } finally { setRefreshing(false); } };
  return <View style={styles.page}><Header title="Tin nhắn" subtitle="Không gian làm việc cùng đối tác" />{error && <ErrorState message={error} onRetry={refresh} />}<FlatList data={conversations} keyExtractor={r => r.id} refreshing={refreshing} onRefresh={refresh} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="Chưa có hội thoại" message="Các cuộc trao đổi dự án của bạn sẽ xuất hiện tại đây." />} renderItem={({ item }) => { const peer = conversationPeer(item, user?.id); const unread = conversationUnread(item, user?.id); return <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Workspace', { roomId: item.id })} style={styles.card}><UserAvatar name={peer.name} uri={peer.avatar} size={44} /><View style={{ flex: 1 }}><Text style={styles.name}>{peer.name}</Text><Text numberOfLines={1} style={styles.project}>{item.project.title}</Text><Text numberOfLines={1} style={styles.preview}>{item.messages.at(-1)?.text || 'Bắt đầu trao đổi về dự án'}</Text></View>{unread ? <Text style={styles.badge}>{unread}</Text> : <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />}</TouchableOpacity>; }} /></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: COLORS.background }, list: { padding: 16 }, card: { padding: 16, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }, name: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary }, project: { fontSize: 12, color: COLORS.primary, marginVertical: 5 }, preview: { fontSize: 12, color: COLORS.textMuted }, badge: { padding: 6, borderRadius: 12, backgroundColor: COLORS.primary, color: COLORS.white } });
