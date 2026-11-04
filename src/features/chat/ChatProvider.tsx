import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { repository } from '../../services/repository';
import { conversationUnread } from './model/selectors';
import type { Conversation } from '../../types/domain';
function useChatValue() {
  const { user } = useAuth();
  const userId = user?.id;
  const load = useCallback(
    async () =>
      userId
        ? (await repository.chat.list(userId)).filter((room) => room.participants.includes(userId))
        : [],
    [userId],
  );
  const {
    data,
    loading,
    error: resourceError,
    refresh,
  } = useAsyncResource<Conversation[]>(load, []);
  const { run, isActive } = useAsyncAction();
  const sendMessage = useCallback(
    (roomId: string, text: string, clientId: string) =>
      run(async () => {
        if (!userId) throw new Error('Vui lòng đăng nhập.');
        await repository.chat.send(roomId, userId, text, clientId);
        if (isActive()) await refresh();
      }),
    [userId, refresh, run, isActive],
  );
  const readConversation = useCallback(
    async (roomId: string) => {
      if (!userId) return;
      await repository.chat.markRead(roomId, userId);
      if (isActive()) await refresh();
    },
    [userId, refresh, isActive],
  );
  return useMemo(
    () => ({
      conversations: data,
      loading: loading,
      error: resourceError,
      chatUnreadCount: userId
        ? data.reduce((sum, room) => sum + conversationUnread(room, userId), 0)
        : 0,
      refreshConversations: refresh,
      sendMessage,
      readConversation,
      isActive,
    }),
    [data, loading, resourceError, refresh, userId, sendMessage, readConversation, isActive],
  );
}
const ChatContext = createContext<ReturnType<typeof useChatValue> | null>(null);
export function ChatProvider({ children }: PropsWithChildren) {
  const value = useChatValue();
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
export function useChatState() {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat must be used within ChatProvider');
  return value;
}
