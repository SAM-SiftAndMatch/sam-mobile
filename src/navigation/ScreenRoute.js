import React from 'react';
import { screenNavigation } from './navigation';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '../context/AppContext';
import { View } from 'react-native';
import { Header } from '../components/common/Header';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { mockPremiumPlans } from '../data/premiumPlans';

export default function ScreenRoute({ screen: Screen }) {
  const params = useLocalSearchParams();
  const { jobs, loading } = useApp();
  const job = jobs.find(j => j.id === params.jobId);
  const plan = mockPremiumPlans.find(p => p.id === params.planId);
  if (params.jobId && !jobs.length && loading) return <LoadingState message="Đang tải dự án…" />;
  if ((params.jobId && !loading && !job) || (params.planId && !plan)) return <View style={{ flex: 1 }}><Header title="Không tìm thấy nội dung" showBack /><EmptyState title="Nội dung không còn khả dụng" message="Quay lại danh sách để tải dữ liệu mới nhất." /></View>;
  return <Screen navigation={screenNavigation} route={{ params: { ...params, job, plan } }} />;
}
