import { useMarketplace } from '../../features/marketplace/MarketplaceProvider';
import { useChat } from '../../features/chat/useChat';
import { useSubscriptions } from '../../features/subscriptions/SubscriptionsProvider';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../design/Text';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { errorMessage } from '../../lib/errors';
import { apiMode, apiUser } from '../../services/api/client';
import { normalizeCheckoutId, paymentLabel, payments, openPayment } from '../../services/payments';
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
  const { data, setData, refresh, error, loading } = useAsyncResource(load, null);
  const current = useRef({ id, owner: user?.id });
  useEffect(() => {
    current.current = { id, owner: user?.id };
    return () => {
      current.current = { id: null, owner: undefined };
    };
  }, [id, user?.id]);
  const [retry, setRetry] = useState<{
    id: string;
    owner: string;
    pending: boolean;
    message: string;
  } | null>(null);
  const retryState = retry?.id === id && retry?.owner === user?.id ? retry : null;
  const prepareRetry = async () => {
    const owner = user?.id;
    if (!id || !owner || retryState?.pending) return;
    const target = id;
    setRetry({ id: target, owner, pending: true, message: '' });
    const isCurrent = () =>
      apiUser()?.id === owner && current.current.owner === owner && current.current.id === target;
    try {
      const updated = await payments.prepareRetry(target);
      if (!isCurrent()) return;
      setData(updated);
      setRetry({
        id: target,
        owner,
        pending: false,
        message: 'Đã đóng liên kết cũ. Quay lại dịch vụ và chọn thanh toán để tạo liên kết mới.',
      });
    } catch (cause) {
      if (isCurrent())
        setRetry({
          id: target,
          owner,
          pending: false,
          message: errorMessage(
            cause,
            'Chưa thể xác nhận đóng liên kết cũ. Vui lòng liên hệ hỗ trợ.',
          ),
        });
    }
  };
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
            <Text>Mã hỗ trợ: {data.supportCode || data.orderId}</Text>
            {data.paymentStatus === 'PENDING' && (
              <Text>Nội dung chuyển khoản: {data.transferContent}</Text>
            )}
            {data.reviewRequired && data.paymentStatus !== 'EXPIRED' && (
              <Text>
                SAM đang đối soát. Nếu đã chuyển tiền, không cần thanh toán lại. Cung cấp mã hỗ trợ
                khi liên hệ.
              </Text>
            )}
            {data.paymentStatus === 'EXPIRED' && (
              <>
                <Text>
                  Nếu chưa chuyển tiền, bạn có thể khôi phục thanh toán. SAM sẽ yêu cầu Pay2S đóng
                  liên kết cũ trước khi cho phép tạo lại. Nếu đã chuyển tiền, hãy kiểm tra lại hoặc
                  liên hệ hỗ trợ.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={retryState?.pending}
                  onPress={() => void prepareRetry()}
                >
                  <Text style={{ color: '#1D4ED8' }}>
                    {retryState?.pending ? 'Đang xác nhận với Pay2S…' : 'Khôi phục thanh toán'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {retryState?.message ? <Text>{retryState.message}</Text> : null}
            {data.paymentStatus === 'PENDING' && data.checkoutUrl && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void openPayment(data).catch(() => {})}
              >
                <Text style={{ color: '#1D4ED8' }}>Tiếp tục thanh toán</Text>
              </TouchableOpacity>
            )}
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
