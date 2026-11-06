import { useMarketplace } from '../../features/marketplace/MarketplaceProvider';
import { useChat } from '../../features/chat/useChat';
import { useSubscriptions } from '../../features/subscriptions/SubscriptionsProvider';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, ScrollView, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../design/Text';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { apiMode } from '../../services/api/client';
import { normalizeCheckoutId, paymentLabel, payments } from '../../services/payments';
export default function PaymentStatusScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { user } = useAuth();
  const { refreshBenefits } = useSubscriptions();
  const { refreshJobs } = useMarketplace();
  const { refreshConversations } = useChat();
  const [saved, setSaved] = useState<{ owner: string; id: string | null } | null>(null);
  useEffect(() => {
    let active = true;
    if (user?.id) {
      const owner = user.id;
      void AsyncStorage.getItem(`sam:checkout:${owner}`).then((v) => {
        if (active) setSaved({ owner, id: v });
      });
    }
    return () => {
      active = false;
    };
  }, [user?.id]);
  const id =
    normalizeCheckoutId(params.orderId) ||
    normalizeCheckoutId(saved?.owner === user?.id ? saved?.id : null);
  const load = useCallback(
    () => (apiMode && user?.id && id ? payments.get(id) : Promise.resolve(null)),
    [user?.id, id],
  );
  const { data, refresh, error, loading } = useAsyncResource(load, null);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh().catch(() => {});
    });
    return () => listener.remove();
  }, [refresh]);
  useEffect(() => {
    if (
      !['PENDING', 'CREATING', 'UNKNOWN'].includes(data?.paymentStatus || '') &&
      !(
        data?.paymentStatus === 'PAID' &&
        ['PENDING', 'RETRY'].includes(data?.fulfillmentStatus || '')
      )
    )
      return;
    let count = 0;
    const timer = setInterval(() => {
      if (++count > 40) {
        clearInterval(timer);
        return;
      }
      void refresh().catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [id, data?.paymentStatus, data?.fulfillmentStatus, refresh]);
  useEffect(() => {
    if (data?.paymentStatus === 'PAID' && data?.fulfillmentStatus === 'APPLIED') {
      void refreshBenefits().catch(() => {});
      void refreshJobs().catch(() => {});
      void refreshConversations().catch(() => {});
    }
  }, [
    data?.paymentStatus,
    data?.fulfillmentStatus,
    refreshBenefits,
    refreshJobs,
    refreshConversations,
  ]);
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Header title="Thanh toán" showBack />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }}>
        <Text style={{ fontSize: 23, fontWeight: '700' }}>
          {data ? paymentLabel(data) : 'Kiểm tra thanh toán'}
        </Text>
        <Text>
          {loading
            ? 'Đang kiểm tra…'
            : error ||
              (!user
                ? 'Đăng nhập để xem đơn của bạn.'
                : 'Kết quả được xác nhận trực tiếp từ Pay2S. Không thanh toán lại khi đang chờ xác nhận.')}
        </Text>
        {data && (
          <>
            <Text>
              {new Intl.NumberFormat('vi-VN').format(data.amount)} đ ·{' '}
              {data.environment === 'SANDBOX' ? 'Thử nghiệm' : 'Thực tế'}
            </Text>
            <Text>{data.transferContent}</Text>
          </>
        )}
        <TouchableOpacity accessibilityRole="button" onPress={() => void refresh().catch(() => {})}>
          <Text style={{ color: '#1D4ED8' }}>Kiểm tra lại</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/payments')}>
          <Text style={{ color: '#1D4ED8' }}>Lịch sử thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
