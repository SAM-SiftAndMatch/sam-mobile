import React, { type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { MarketplaceProvider } from '../features/marketplace/MarketplaceProvider';
import { ChatProvider } from '../features/chat/ChatProvider';
import { NotificationsProvider } from '../features/notifications/NotificationsProvider';
import { SubscriptionsProvider } from '../features/subscriptions/SubscriptionsProvider';

function SessionProviders({ children }: PropsWithChildren) {
  const { user, sessionId } = useAuth();
  // Remount every account-bound resource even when the same account signs in again.
  return (
    <MarketplaceProvider key={`${user?.id ?? 'guest'}:${sessionId}`}>
      <ChatProvider>
        <NotificationsProvider>
          <SubscriptionsProvider>{children}</SubscriptionsProvider>
        </NotificationsProvider>
      </ChatProvider>
    </MarketplaceProvider>
  );
}
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SessionProviders>{children}</SessionProviders>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
