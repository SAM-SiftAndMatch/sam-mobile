import { useCallback } from 'react';
import { screenNavigation } from '../../navigation/navigation';
import { useChatState } from './ChatProvider';
/** Navigation belongs in UI hooks, not in data providers. */
export function useChat() {
  const state = useChatState();
  const openMessages = useCallback(
    (applicationId?: string) => {
      const room = applicationId
        ? state.conversations.find((item) => item.application.id === applicationId)
        : undefined;
      if (room) screenNavigation.navigate('Workspace', { roomId: room.id });
      else screenNavigation.navigate('Messages');
    },
    [state.conversations],
  );
  return { ...state, openMessages };
}
