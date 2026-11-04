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
import type { Notification } from '../../types/domain';
function useNotificationsValue() {
  const { user } = useAuth();
  const userId = user?.id;
  const load = useCallback(
    () => (userId ? repository.notifications.list(userId) : Promise.resolve([])),
    [userId],
  );
  const {
    data,
    setData,
    loading,
    error: resourceError,
    refresh,
  } = useAsyncResource<Notification[]>(load, []);
  const { run, error: mutationError, clearError, isActive } = useAsyncAction();
  const refreshNotifications = useCallback(() => {
    clearError();
    return refresh();
  }, [clearError, refresh]);
  const markRead = useCallback(
    (id: string) =>
      run(async () => {
        if (!data.some((item) => item.id === id))
          throw new Error('Thông báo không thuộc tài khoản hiện tại.');
        await repository.notifications.markRead(id);
        if (isActive())
          setData((current) =>
            current.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
          );
      }),
    [data, setData, run, isActive],
  );
  return useMemo(
    () => ({
      notifications: data,
      loading: loading,
      error: resourceError || mutationError,
      unreadCount: data.filter((item) => !item.isRead).length,
      refreshNotifications,
      markRead,
    }),
    [data, loading, resourceError, mutationError, refreshNotifications, markRead],
  );
}
const NotificationsContext = createContext<ReturnType<typeof useNotificationsValue> | null>(null);
export function NotificationsProvider({ children }: PropsWithChildren) {
  const value = useNotificationsValue();
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error('useNotifications must be used within NotificationsProvider');
  return value;
}
