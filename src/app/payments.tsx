import React, { useCallback, useEffect, useState } from 'react';
import { AppState, ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Text from '../design/Text';
import { Header } from '../components/common/Header';
import { useAuth } from '../features/auth/AuthProvider';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { apiMode } from '../services/api/client';
import { payments, paymentLabel, type Checkout } from '../services/payments';
export default function PaymentHistory() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const load = useCallback(
    () => (apiMode && user?.id ? payments.history(page) : Promise.resolve([])),
    [user?.id, page],
  );
  const { data, refresh, error, loading } = useAsyncResource<Checkout[]>(load, []);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh().catch(() => {});
    });
    return () => sub.remove();
  }, [refresh]);
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Header title="Lịch sử thanh toán" showBack />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        {(error || loading) && <Text>{error || 'Đang tải…'}</Text>}
        {data.map((o) => (
          <TouchableOpacity
            key={o.orderId}
            accessibilityRole="button"
            style={{ padding: 18, backgroundColor: 'white', borderRadius: 14 }}
            onPress={() =>
              router.push({ pathname: '/payment-return', params: { orderId: o.orderId } })
            }
          >
            <Text>
              {new Intl.NumberFormat('vi-VN').format(o.amount)} đ · {paymentLabel(o)}
            </Text>
            {o.createdAt && (
              <Text>{new Date(o.paidAt || o.createdAt).toLocaleString('vi-VN')}</Text>
            )}
            <Text>
              {o.transferContent} · {o.environment === 'SANDBOX' ? 'Thử nghiệm' : 'Thực tế'}
            </Text>
          </TouchableOpacity>
        ))}
        {!loading && !error && !data.length && <Text>Chưa có giao dịch thanh toán mới.</Text>}
        <TouchableOpacity
          accessibilityRole="button"
          disabled={page === 0}
          onPress={() => setPage((p) => p - 1)}
        >
          <Text>Trang trước</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={data.length !== 20}
          onPress={() => setPage((p) => p + 1)}
        >
          <Text>Trang sau</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
