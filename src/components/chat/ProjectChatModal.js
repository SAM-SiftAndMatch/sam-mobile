import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { UserAvatar } from '../common/UserAvatar';
import { EdgeSwipeBack } from '../common/EdgeSwipeBack';
import { conversationPeer, conversationUnread } from '../../services/projectChatStore';
import { formatCurrency } from '../../utils/formatCurrency';

const time = (date) => new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const day = (date) => new Date(date).toLocaleDateString('vi-VN');

function IconButton({ name, label, onPress }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}><Ionicons name={name} size={23} color={COLORS.primary} /></TouchableOpacity>;
}

function ConversationThread({ room, userId, onBack, onClose }) {
  const { sendMessage, readConversation } = useApp();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(false);
  const lock = useRef(false);
  const attempt = useRef(null);
  const peer = conversationPeer(room, userId);
  const unread = conversationUnread(room, userId);

  useEffect(() => {
    if (unread) readConversation(room.id).catch(() => setError('Chưa thể cập nhật trạng thái đã đọc.'));
  }, [room.id, unread, readConversation]);

  const send = async () => {
    const body = text.trim();
    if (!body || lock.current) return;
    lock.current = true; setSending(true); setError('');
    if (attempt.current?.text !== body) attempt.current = { text: body, id: `${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}` };
    try {
      await sendMessage(room.id, body, attempt.current.id);
      setText(''); attempt.current = null;
    } catch (err) { setError(err.message || 'Gửi chưa thành công. Nhấn gửi để thử lại.'); }
    finally { lock.current = false; setSending(false); }
  };

  return <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.header}>
      <IconButton name="chevron-back" label="Danh sách hội thoại" onPress={onBack} />
      <UserAvatar uri={peer.avatar} name={peer.name} size={42} />
      <View style={styles.headerText}><Text numberOfLines={1} style={styles.title}>{peer.name}</Text><Text style={styles.caption}>{peer.role} · Chat dự án</Text></View>
      <IconButton name="close" label="Đóng chat" onPress={onClose} />
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Thông tin dự án" accessibilityState={{ expanded: details }} onPress={() => setDetails(!details)} style={styles.project}>
      <View style={styles.projectIcon}><Ionicons name="rocket-outline" size={22} color={COLORS.primary} /></View>
      <View style={styles.headerText}><Text style={styles.eyebrow}>DỰ ÁN ĐANG THỰC HIỆN</Text><Text style={styles.projectTitle} numberOfLines={details ? undefined : 1}>{room.project.title}</Text></View>
      <Ionicons name={details ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.primary} />
    </TouchableOpacity>
    {details && <View style={styles.details}>
      <Text style={styles.caption}>Báo giá đã duyệt: <Text style={styles.bold}>{formatCurrency(room.application.proposedPrice, room.application.currency || room.project.currency)}</Text></Text>
      <Text style={styles.caption}>Thời gian: {room.application.deliveryTime || 'Theo thỏa thuận'} · Hạn dự án: {day(room.project.deadline)}</Text>
      <Text style={styles.caption}>Trao đổi yêu cầu, tiến độ và nội dung bàn giao tại đây.</Text>
    </View>}
    <FlatList
      style={styles.fill}
      inverted
      data={[...room.messages].reverse()}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.messages}
      ListEmptyComponent={<View style={styles.emptyMessages}>
        <Ionicons name="chatbubbles-outline" size={44} color={COLORS.primary} />
        <Text style={styles.emptyTitle}>Bắt đầu cùng nhau</Text>
        <Text style={styles.emptyBody}>Đề xuất đã được duyệt. Gửi lời chào và thống nhất bước đầu tiên của dự án.</Text>
      </View>}
      renderItem={({ item }) => {
        const mine = item.senderId === userId;
        return <View style={[styles.messageRow, mine && styles.myRow]}>
          <View style={[styles.bubble, mine && styles.myBubble]}><Text selectable style={[styles.messageText, mine && styles.white]}>{item.text}</Text></View>
          <Text style={styles.timestamp}>{mine ? 'Bạn' : peer.name} · {day(item.createdAt)} {time(item.createdAt)}</Text>
        </View>;
      }}
      ListFooterComponent={<Text style={styles.systemNote}>Dự án bắt đầu · {day(room.startedAt)}</Text>}
    />
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <View style={styles.composer}>
      <TextInput accessibilityLabel="Nội dung tin nhắn" placeholder="Nhắn tin về dự án…" placeholderTextColor={COLORS.textMuted} multiline maxLength={2000} value={text} onChangeText={setText} editable={!sending} style={styles.input} />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Gửi tin nhắn" accessibilityState={{ disabled: !text.trim() || sending, busy: sending }} disabled={!text.trim() || sending} onPress={send} style={!text.trim() || sending ? styles.disabled : undefined}>
        <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.send}>{sending ? <ActivityIndicator color={COLORS.white} /> : <Ionicons name="send" size={20} color={COLORS.white} />}</LinearGradient>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>;
}

export function ProjectChatModal() {
  const { user } = useAuth();
  const { chatView, conversations, closeMessages, selectConversation, refreshConversations, loading } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const room = conversations.find((item) => item.id === chatView?.roomId);
  const refresh = async () => {
    setRefreshing(true); setError('');
    try { await refreshConversations(); } catch (err) { setError(err.message || 'Không thể tải hội thoại.'); }
    finally { setRefreshing(false); }
  };
  const back = () => room ? selectConversation(null) : closeMessages();
  return <Modal visible={!!chatView && !!user} animationType="slide" presentationStyle="fullScreen" onRequestClose={back}>
    <SafeAreaProvider><SafeAreaView style={styles.container}>
      <EdgeSwipeBack onBack={back}>
      {room && user ? <ConversationThread key={`${user.id}:${room.id}`} room={room} userId={user.id} onBack={() => selectConversation(null)} onClose={closeMessages} /> : <>
        <View style={styles.header}><View style={styles.headerText}><Text style={styles.pageTitle}>Tin nhắn</Text><Text style={styles.caption}>Đồng hành trong từng dự án</Text></View><IconButton name="close" label="Đóng tin nhắn" onPress={closeMessages} /></View>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.cyan]} style={styles.banner}><Ionicons name="chatbubbles" size={27} color={COLORS.white} /><View style={styles.headerText}><Text style={styles.bannerTitle}>Không gian làm việc chung</Text><Text style={styles.bannerText}>Chat mở khi customer duyệt đề xuất và dự án bắt đầu.</Text></View></LinearGradient>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <FlatList data={conversations} keyExtractor={(item) => item.id} contentContainerStyle={styles.inbox} refreshing={refreshing} onRefresh={refresh}
          ListEmptyComponent={loading ? <ActivityIndicator color={COLORS.primary} /> : <View style={styles.emptyMessages}><Ionicons name="mail-open-outline" size={50} color={COLORS.primary} /><Text style={styles.emptyTitle}>Chưa có hội thoại</Text><Text style={styles.emptyBody}>Dự án đã duyệt sẽ xuất hiện ở đây. Đề xuất đang chờ hoặc bị từ chối chưa mở chat.</Text></View>}
          renderItem={({ item }) => {
            const peer = conversationPeer(item, user?.id);
            const unread = conversationUnread(item, user?.id);
            const last = item.messages.at(-1);
            return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${peer.name}, ${item.project.title}${unread ? `, ${unread} tin chưa đọc` : ''}`} onPress={() => selectConversation(item.id)} style={styles.conversation}>
              <UserAvatar uri={peer.avatar} name={peer.name} size={48} />
              <View style={styles.headerText}><Text style={styles.title} numberOfLines={1}>{peer.name}</Text><Text style={styles.conversationProject} numberOfLines={1}>{item.project.title}</Text><Text style={styles.caption} numberOfLines={1}>{last ? `${last.senderId === user?.id ? 'Bạn: ' : ''}${last.text}` : 'Dự án đã bắt đầu. Gửi lời chào!'}</Text></View>
              {unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text></View> : <Ionicons name="chevron-forward" color={COLORS.textMuted} size={18} />}
            </TouchableOpacity>;
          }} />
      </>}
      </EdgeSwipeBack>
    </SafeAreaView></SafeAreaProvider>
  </Modal>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 }, container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: COLORS.white },
  headerText: { flex: 1, minWidth: 0 }, title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' }, pageTitle: { color: COLORS.textPrimary, fontSize: 27, fontWeight: '800', marginBottom: 4 },
  caption: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 19 }, iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, margin: 16, borderRadius: 22 }, bannerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 6 }, bannerText: { color: COLORS.white, fontSize: 12, lineHeight: 19 },
  inbox: { padding: 16, paddingTop: 0, flexGrow: 1 }, conversation: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  conversationProject: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginVertical: 5 }, badge: { backgroundColor: COLORS.primary, borderRadius: 14, minWidth: 24, padding: 5, alignItems: 'center' }, badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  project: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 14, padding: 14, borderRadius: 18, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border }, projectIcon: { backgroundColor: COLORS.primaryBackground, padding: 10, borderRadius: 12 },
  eyebrow: { color: COLORS.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 5 }, projectTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 13, lineHeight: 19 },
  details: { paddingHorizontal: 22, paddingBottom: 12, gap: 5 }, bold: { fontWeight: '700', color: COLORS.primary },
  messages: { padding: 16, flexGrow: 1 }, messageRow: { alignItems: 'flex-start', marginVertical: 8 }, myRow: { alignItems: 'flex-end' },
  bubble: { backgroundColor: COLORS.white, padding: 14, borderRadius: 20, borderBottomLeftRadius: 5, maxWidth: '86%' }, myBubble: { backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 5 }, messageText: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 23 }, white: { color: COLORS.white },
  timestamp: { color: COLORS.textMuted, fontSize: 10, marginTop: 5, maxWidth: '90%' }, systemNote: { color: COLORS.textMuted, textAlign: 'center', fontSize: 11, padding: 14 },
  composer: { flexDirection: 'row', gap: 12, alignItems: 'flex-end', marginHorizontal: 12, marginVertical: 8, padding: 10, backgroundColor: COLORS.white, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, minHeight: 44, maxHeight: 130, paddingHorizontal: 10, paddingVertical: 12, color: COLORS.textPrimary, fontSize: 15 }, send: { width: 44, height: 44, borderRadius: 17, justifyContent: 'center', alignItems: 'center' }, disabled: { opacity: 0.4 },
  emptyMessages: { alignItems: 'center', padding: 30, gap: 14 }, emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' }, emptyBody: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 23 }, error: { color: COLORS.danger, paddingHorizontal: 20, paddingVertical: 8, fontSize: 12 },
});
