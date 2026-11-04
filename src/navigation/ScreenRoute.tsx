import React, { type ComponentType } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/colors';
import { useMarketplace } from '../features/marketplace/MarketplaceProvider';
import { useSubscriptions } from '../features/subscriptions/SubscriptionsProvider';
import { Header } from '../components/common/Header';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import type { Job, PremiumPlan } from '../types/domain';
import { screenNavigation } from './navigation';
import { singleParam } from './routes';

interface ScreenProps {
  navigation: typeof screenNavigation;
  route: {
    params: Record<string, string | undefined | Job | PremiumPlan> & {
      job?: Job;
      plan?: PremiumPlan;
    };
  };
}
export default function ScreenRoute({ screen: Screen }: { screen: ComponentType<ScreenProps> }) {
  const raw = useLocalSearchParams();
  const params = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, singleParam(value)]),
  );
  const { jobs, loading, error, refreshJobs } = useMarketplace();
  const { plans, loading: loadingPlans } = useSubscriptions();
  const job = jobs.find((item) => item.id === params.jobId);
  const plan = plans.find((item) => item.id === params.planId);
  let content;
  if ((params.jobId && !jobs.length && loading) || (params.planId && loadingPlans))
    content = <LoadingState message="Đang tải dữ liệu…" />;
  else if (params.jobId && !job && error)
    content = (
      <>
        <Header title="Chi tiết dự án" showBack />
        <ErrorState message={error} onRetry={() => void refreshJobs().catch(() => {})} />
      </>
    );
  else if ((params.jobId && !job) || (params.planId && !plan))
    content = (
      <>
        <Header title="Không tìm thấy nội dung" showBack />
        <EmptyState
          title="Nội dung không còn khả dụng"
          message="Quay lại danh sách để tải dữ liệu mới nhất."
        />
      </>
    );
  else
    content = <Screen navigation={screenNavigation} route={{ params: { ...params, job, plan } }} />;
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 760 }}>{content}</View>
    </View>
  );
}
