import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { repository } from '../../services/repository';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useAuth } from '../auth/AuthProvider';
import { useNotifications } from '../notifications/NotificationsProvider';
import type { PremiumPlan } from '../../types/domain';
function useSubscriptionsValue() {
  const { user, updateProfile } = useAuth();
  const userId = user?.id;
  const { refreshNotifications } = useNotifications();
  const {
    data,
    loading,
    refresh,
    error: resourceError,
  } = useAsyncResource<PremiumPlan[]>(repository.subscriptions.listPlans, []);
  const { run, pending, error, clearError, isActive } = useAsyncAction();
  const refreshPlans = useCallback(() => {
    clearError();
    return refresh();
  }, [clearError, refresh]);
  const subscribeToPlan = useCallback(
    (planId: string) =>
      run(async () => {
        if (!userId) throw new Error('Vui lòng đăng nhập.');
        const result = await repository.subscriptions.subscribe(userId, planId);
        if (isActive()) await updateProfile({ isPremium: true, premiumPlan: result.plan.name });
        if (isActive()) await refreshNotifications();
        return result;
      }),
    [userId, updateProfile, refreshNotifications, run, isActive],
  );
  return useMemo(
    () => ({
      plans: data,
      loading: loading,
      error: resourceError || error,
      subscribing: pending,
      subscribeToPlan,
      refreshPlans,
    }),
    [data, loading, resourceError, error, pending, subscribeToPlan, refreshPlans],
  );
}
const SubscriptionsContext = createContext<ReturnType<typeof useSubscriptionsValue> | null>(null);
export function SubscriptionsProvider({ children }: PropsWithChildren) {
  const value = useSubscriptionsValue();
  return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>;
}
export function useSubscriptions() {
  const value = useContext(SubscriptionsContext);
  if (!value) throw new Error('useSubscriptions must be used within SubscriptionsProvider');
  return value;
}
