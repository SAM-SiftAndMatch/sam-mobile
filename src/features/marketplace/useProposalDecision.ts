import { useCallback } from 'react';
import { useMarketplace } from './MarketplaceProvider';
import { useChat } from '../chat/useChat';
import { screenNavigation } from '../../navigation/navigation';
import type { ProposalStatus } from '../../types/domain';
/** Coordinates the existing mock approval workflow across marketplace and chat. */
export function useProposalDecision() {
  const { changeAppStatus } = useMarketplace();
  const { refreshConversations, isActive } = useChat();
  return useCallback(
    async (id: string, status: ProposalStatus) => {
      const result = await changeAppStatus(id, status);
      if (status === 'accepted' && isActive()) {
        const rooms = await refreshConversations();
        const room = rooms.find((item) => item.application.id === id);
        if (room && isActive()) screenNavigation.navigate('Workspace', { roomId: room.id });
      }
      return result;
    },
    [changeAppStatus, refreshConversations, isActive],
  );
}
