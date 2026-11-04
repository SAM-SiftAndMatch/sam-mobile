import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMessageComposer } from '../useMessageComposer';
import { useChat } from '../useChat';
import { COLORS } from '../../../constants/colors';
import { UserAvatar } from '../../../components/common/UserAvatar';
import { conversationPeer, conversationUnread } from '../model/selectors';
import { formatCurrency } from '../../../utils/formatCurrency';

const time = (date) =>
  new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const day = (date) => new Date(date).toLocaleDateString('vi-VN');

export function ConversationThread({ room, userId, keyboardVerticalOffset = 0 }) {
  const { readConversation } = useChat();
  const { text, setText, sending, error, setError, send } = useMessageComposer(room.id, userId);
  const [details, setDetails] = useState(false);
  const peer = conversationPeer(room, userId);
  const unread = conversationUnread(room, userId);

  useEffect(() => {
    let active = true;
    if (unread)
      readConversation(room.id).catch(() => {
        if (active) setError('Chưa thể cập nhật trạng thái đã đọc.');
      });
    return () => {
      active = false;
    };
  }, [room.id, unread, readConversation, setError]);

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <UserAvatar uri={peer.avatar} name={peer.name} size={42} />
        <View style={styles.headerText}>
          <Text numberOfLines={1} style={styles.title}>
            {peer.name}
          </Text>
          <Text style={styles.caption}>{peer.role} · Chat dự án</Text>
        </View>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Thông tin dự án"
        accessibilityState={{ expanded: details }}
        onPress={() => setDetails(!details)}
        style={styles.project}
      >
        <View style={styles.projectIcon}>
          <Ionicons name="rocket-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>DỰ ÁN ĐANG THỰC HIỆN</Text>
          <Text style={styles.projectTitle} numberOfLines={details ? undefined : 1}>
            {room.project.title}
          </Text>
        </View>
        <Ionicons name={details ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.primary} />
      </TouchableOpacity>
      {details && (
        <View style={styles.details}>
          <Text style={styles.caption}>
            Báo giá đã duyệt:{' '}
            <Text style={styles.bold}>
              {formatCurrency(
                room.application.proposedPrice,
                room.application.currency || room.project.currency,
              )}
            </Text>
          </Text>
          <Text style={styles.caption}>
            Thời gian: {room.application.deliveryTime || 'Theo thỏa thuận'} · Hạn dự án:{' '}
            {day(room.project.deadline)}
          </Text>
          <Text style={styles.caption}>
            Trao đổi yêu cầu, tiến độ và nội dung bàn giao tại đây.
          </Text>
        </View>
      )}
      <FlatList
        style={styles.fill}
        inverted
        data={[...room.messages].reverse()}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.messages}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Ionicons name="chatbubbles-outline" size={44} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Bắt đầu cùng nhau</Text>
            <Text style={styles.emptyBody}>
              Đề xuất đã được duyệt. Gửi lời chào và thống nhất bước đầu tiên của dự án.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const mine = item.senderId === userId;
          return (
            <View style={[styles.messageRow, mine && styles.myRow]}>
              <View style={[styles.bubble, mine && styles.myBubble]}>
                <Text selectable style={[styles.messageText, mine && styles.white]}>
                  {item.text}
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {mine ? 'Bạn' : peer.name} · {day(item.createdAt)} {time(item.createdAt)}
              </Text>
            </View>
          );
        }}
        ListFooterComponent={
          <Text style={styles.systemNote}>Dự án bắt đầu · {day(room.startedAt)}</Text>
        }
      />
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Nội dung tin nhắn"
          placeholder="Nhắn tin về dự án…"
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={2000}
          value={text}
          onChangeText={setText}
          editable={!sending}
          style={styles.input}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Gửi tin nhắn"
          accessibilityState={{ disabled: !text.trim() || sending, busy: sending }}
          disabled={!text.trim() || sending}
          onPress={send}
          style={!text.trim() || sending ? styles.disabled : undefined}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.send}>
            {sending ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  headerText: { flex: 1, minWidth: 0 },
  title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  caption: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 19 },
  project: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  projectIcon: { backgroundColor: COLORS.primaryBackground, padding: 10, borderRadius: 12 },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  projectTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 13, lineHeight: 19 },
  details: { paddingHorizontal: 22, paddingBottom: 12, gap: 5 },
  bold: { fontWeight: '700', color: COLORS.primary },
  messages: { padding: 16, flexGrow: 1 },
  messageRow: { alignItems: 'flex-start', marginVertical: 8 },
  myRow: { alignItems: 'flex-end' },
  bubble: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderBottomLeftRadius: 5,
    maxWidth: '86%',
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
  },
  messageText: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 23 },
  white: { color: COLORS.white },
  timestamp: { color: COLORS.textMuted, fontSize: 12, marginTop: 5, maxWidth: '90%' },
  systemNote: { color: COLORS.textMuted, textAlign: 'center', fontSize: 11, padding: 14 },
  composer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'BeVietnamPro_400Regular',
    minHeight: 44,
    maxHeight: 130,
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  send: { width: 44, height: 44, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.4 },
  emptyMessages: { alignItems: 'center', padding: 30, gap: 14 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  emptyBody: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 23 },
  error: { color: COLORS.danger, paddingHorizontal: 20, paddingVertical: 8, fontSize: 12 },
});
