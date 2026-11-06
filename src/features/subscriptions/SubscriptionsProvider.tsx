import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { apiMode, apiRequest } from '../../services/api/client';
import { openPayment } from '../../services/payments';
import { useEffect } from 'react';
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
  } = useAsyncResource<PremiumPlan[]>(
    useCallback(
      () => (userId ? repository.subscriptions.listPlans() : Promise.resolve([])),
      [userId],
    ),
    [],
  );
  const loadEntitlements = useCallback(
    () =>
      apiMode && userId
        ? apiRequest<{ packageId: string; entitled: boolean }[]>('/subscriptions/me')
        : Promise.resolve([]),
    [userId],
  );
  const { data: entitlements, refresh: refreshEntitlements } = useAsyncResource(
    loadEntitlements,
    [],
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshEntitlements().catch(() => {});
        void refreshNotifications().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [refreshEntitlements, refreshNotifications]);
  const currentPlanName = !apiMode
    ? user?.premiumPlan
    : data.find((p) => entitlements.some((e) => e.packageId === p.id && e.entitled))?.name;
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
        if (isActive() && !apiMode && result.success)
          await updateProfile({ isPremium: true, premiumPlan: result.plan.name });
        if (isActive() && apiMode && result.checkout) await openPayment(result.checkout);
        if (isActive()) await refreshEntitlements();
        if (isActive()) await refreshNotifications();
        return result;
      }),
    [userId, updateProfile, refreshNotifications, refreshEntitlements, run, isActive],
  );
  return useMemo(
    () => ({
      plans: data,
      currentPlanName,
      refreshBenefits: refreshEntitlements,
      loading: loading,
      error: resourceError || error,
      subscribing: pending,
      subscribeToPlan,
      refreshPlans,
    }),
    [
      data,
      currentPlanName,
      loading,
      resourceError,
      error,
      pending,
      subscribeToPlan,
      refreshPlans,
      refreshEntitlements,
    ],
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
