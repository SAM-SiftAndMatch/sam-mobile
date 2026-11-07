import { useMarketplace } from '../../features/marketplace/MarketplaceProvider';
import { useChat } from '../../features/chat/useChat';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, TouchableOpacity, View } from 'react-native';
import Text from '../../design/Text';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { apiMode, apiRequest } from '../../services/api/client';
import { openPayment } from '../../services/payments';
function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{ paddingVertical: 12, opacity: disabled ? 0.5 : 1 }}
    >
      <Text style={{ color: '#1D4ED8', fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}
interface Addons {
  orderStatus?: string;
  totalDue: number;
  featuredActive: boolean;
  urgentActive: boolean;
  featuredPending: boolean;
  urgentPending: boolean;
  businessIncluded: boolean;
}
export function ProjectAddonPayment({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const load = useCallback(
    () =>
      apiMode && user?.role === 'customer'
        ? apiRequest<Addons>(`/jobs/${jobId}/addons`)
        : Promise.resolve(null),
    [jobId, user?.role],
  );
  const { data, refresh, error } = useAsyncResource(load, null);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void refresh().catch(() => {});
    });
    return () => sub.remove();
  }, [refresh]);
  useEffect(() => {
    if (data?.orderStatus !== 'PENDING') return;
    let count = 0;
    const timer = setInterval(() => {
      if (++count > 24) {
        clearInterval(timer);
        return;
      }
      void refresh().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [data?.orderStatus, refresh]);
  if (!apiMode || user?.role !== 'customer') return null;
  const execute = async (action: 'pay' | 'featured' | 'urgent') => {
    setBusy(true);
    setFailure('');
    try {
      if (action !== 'pay')
        await apiRequest(`/jobs/${jobId}/addons`, 'POST', {
          featured: action === 'featured',
          urgent: action === 'urgent',
        });
      await refresh();
      if (action === 'pay')
        await openPayment(await apiRequest(`/jobs/${jobId}/addons/checkout`, 'POST', {}));
    } catch (e) {
      setFailure(e instanceof Error ? e.message : 'Không tạo được thanh toán.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ padding: 18, backgroundColor: 'white', borderRadius: 16, gap: 8 }}>
      <Text style={{ fontWeight: '700' }}>Tính năng dự án</Text>
      {(failure || error) && <Text>{failure || error}</Text>}
      {data && (
        <>
          <Text>
            {data.featuredActive ? 'Đã bật Nổi bật. ' : ''}
            {data.urgentActive ? 'Đã bật Gợi ý freelancer.' : ''}
          </Text>
          {data.orderStatus === 'PENDING' ? (
            <>
              <Text>
                Phí tính năng chờ thanh toán: {new Intl.NumberFormat('vi-VN').format(data.totalDue)}{' '}
                đ
              </Text>
              <Button
                label="Thanh toán tính năng qua Pay2S"
                disabled={busy}
                onPress={() => void execute('pay')}
              />
            </>
          ) : data.orderStatus === 'PAID_UNAPPLIED' ? (
            <Text>Đã nhận tiền, cần hỗ trợ đối soát.</Text>
          ) : (
            <>
              {!data.featuredActive && (
                <Button
                  label="Chọn Nổi bật"
                  disabled={busy}
                  onPress={() => void execute('featured')}
                />
              )}{' '}
              {!data.urgentActive && (
                <Button
                  label="Chọn Gợi ý freelancer"
                  disabled={busy}
                  onPress={() => void execute('urgent')}
                />
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}
export function ContractFunding({ roomId }: { roomId: string }) {
  const { refreshJobs } = useMarketplace();
  const { refreshConversations } = useChat();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const load = useCallback(async () => {
    if (!apiMode || !user?.id) return null;
    const contract = await apiRequest<{ id: string; status: string }>(
      `/chat/rooms/${roomId}/contract`,
    );
    if (contract.status !== 'ACTIVE') return { contract, funding: null };
    const funding = await apiRequest<{
      fundPaid: boolean;
      depositPaid: boolean;
      clientAmount: number;
      depositAmount: number;
      allPaid: boolean;
    }>(`/payments/funding/${contract.id}`);
    return { contract, funding };
  }, [roomId, user?.id]);
  const { data, refresh, error } = useAsyncResource(load, null);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void refresh().catch(() => {});
    });
    return () => sub.remove();
  }, [refresh]);
  const hasFunding = Boolean(data?.funding);
  const allPaid = data?.funding?.allPaid;
  useEffect(() => {
    if (!hasFunding || allPaid) return;
    let count = 0;
    const timer = setInterval(() => {
      if (++count > 24) {
        clearInterval(timer);
        return;
      }
      void refresh().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [allPaid, hasFunding, refresh]);
  useEffect(() => {
    if (allPaid) {
      void refreshJobs().catch(() => {});
      void refreshConversations().catch(() => {});
    }
  }, [allPaid, refreshJobs, refreshConversations]);
  if (!apiMode) return null;
  const pay = async () => {
    if (!data) return;
    setBusy(true);
    setFailure('');
    try {
      const payment = await apiRequest<{ orderId: string; checkoutUrl?: string }>(
        `/payments/${user?.role === 'customer' ? 'fund' : 'deposit'}`,
        'POST',
        { contractId: data.contract.id },
      );
      await openPayment(payment);
    } catch (e) {
      setFailure(e instanceof Error ? e.message : 'Không tạo được thanh toán.');
    } finally {
      setBusy(false);
    }
  };
  const funding = data?.funding;
  const paid = user?.role === 'customer' ? funding?.fundPaid : funding?.depositPaid;
  return (
    <View style={{ padding: 18, backgroundColor: 'white', borderRadius: 16, gap: 10 }}>
      <Text style={{ fontWeight: '700' }}>Nạp tiền khởi động dự án</Text>
      {(failure || error) && <Text>{failure || error}</Text>}
      {data && !funding && <Text>Hợp đồng cần được hai bên ký trước khi thanh toán.</Text>}
      {funding && (
        <>
          {funding.allPaid && <Text>Đã xác nhận đủ tiền hai bên.</Text>}
          <Text>
            Khách hàng: {funding.fundPaid ? 'Đã nạp' : 'Chưa nạp'} · Freelancer:{' '}
            {funding.depositPaid ? 'Đã cọc' : 'Chưa cọc'}
          </Text>
          {!paid && (
            <Button
              disabled={busy}
              label={`Thanh toán ${new Intl.NumberFormat('vi-VN').format(user?.role === 'customer' ? funding.clientAmount : funding.depositAmount)} đ qua Pay2S`}
              onPress={() => void pay()}
            />
          )}
          <Button label="Kiểm tra trạng thái" onPress={() => void refresh().catch(() => {})} />
        </>
      )}
    </View>
  );
}
