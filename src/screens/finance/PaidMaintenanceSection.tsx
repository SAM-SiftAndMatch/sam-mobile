import React, { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { apiMode, apiRequest } from '../../services/api/client';
import { money, dateTime } from '../../services/finance';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';
interface Quote {
  id: string;
  amount: number;
  deliveryDays: number;
  scope: string;
  status: string;
}
interface Order {
  id: string;
  amount: number;
  scope: string;
  status: string;
  dueAt?: string;
  submittedResult?: string;
}
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
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={[styles.button, disabled && { opacity: 0.4 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}
export function QuoteSection({ ticketId, onChanged }: { ticketId: string; onChanged: () => void }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('7');
  const [scope, setScope] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(
    () =>
      apiMode && user?.id
        ? apiRequest<Quote[]>(`/maintenance-tickets/${ticketId}/quotes`)
        : Promise.resolve([]),
    [ticketId, user?.id],
  );
  const { data, refresh } = useAsyncResource<Quote[]>(load, []);
  const execute = async (path: string, body: unknown) => {
    setBusy(true);
    setError('');
    try {
      await apiRequest(path, 'POST', body);
      await refresh();
      onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không gửi được báo giá.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Báo giá bảo trì riêng</Text>
      <Text style={styles.note}>
        Chấp thuận tạo đơn hàng, chưa thu tiền. Phí nền tảng 10%; đơn mới có 7 ngày bảo trì sau
        nghiệm thu.
      </Text>
      {data.map((q) => (
        <View key={q.id} style={styles.quote}>
          <Text style={styles.title}>
            {money(q.amount)} · {q.deliveryDays} ngày
          </Text>
          <Text style={styles.body}>{q.scope}</Text>
          <Text style={styles.muted}>
            {q.status === 'QUOTED'
              ? 'Chờ chấp thuận'
              : q.status === 'ACCEPTED'
                ? 'Đã chấp thuận'
                : 'Đã được thay thế'}
          </Text>
          {user?.role === 'customer' && q.status === 'QUOTED' && (
            <Button
              label="Đồng ý phạm vi, giá và điều kiện"
              disabled={busy}
              onPress={() => void execute(`/maintenance-quotes/${q.id}/accept`, {})}
            />
          )}
        </View>
      ))}
      {user?.role === 'freelancer' && !data.some((q) => q.status === 'ACCEPTED') && (
        <>
          <Text style={styles.label}>Giá trọn gói (VND)</Text>
          <TextInput
            accessibilityLabel="Giá bảo trì"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.label}>Số ngày thực hiện sau thanh toán</Text>
          <TextInput
            accessibilityLabel="Số ngày thực hiện"
            value={days}
            onChangeText={setDays}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.label}>Phạm vi và kết quả bàn giao</Text>
          <TextInput
            accessibilityLabel="Phạm vi bảo trì"
            value={scope}
            onChangeText={setScope}
            multiline
            maxLength={8000}
            style={[styles.input, { minHeight: 100 }]}
          />
          <Button
            label="Gửi báo giá"
            disabled={busy || !scope.trim() || !amount}
            onPress={() =>
              void execute(`/maintenance-tickets/${ticketId}/quotes`, {
                amount: Number(amount),
                deliveryDays: Number(days),
                scope,
              })
            }
          />
        </>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
export function PaidOrdersSection({ scopeId }: { scopeId: string }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Order | null>(null);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(
    () =>
      apiMode && user?.id
        ? apiRequest<Order[]>(`/projects/${scopeId}/paid-maintenance-orders`)
        : Promise.resolve([]),
    [scopeId, user?.id],
  );
  const { data, refresh } = useAsyncResource<Order[]>(load, []);
  const checkout = async (order: string) => {
    setBusy(true);
    setError('');
    try {
      const payment = await apiRequest<{ checkoutUrl?: string; vnpayUrl?: string }>(
        `/paid-maintenance-orders/${order}/checkout`,
        'POST',
      );
      const target = payment.checkoutUrl || payment.vnpayUrl;
      if (!target) throw new Error('Chưa tạo được thanh toán.');
      const parsed = new URL(target);
      if (
        parsed.protocol !== 'https:' ||
        ![
          'payment.pay2s.vn',
          'sandbox-payment.pay2s.vn',
          'pay.vnpay.vn',
          'sandbox.vnpayment.vn',
        ].includes(parsed.hostname)
      )
        throw new Error('Liên kết thanh toán không hợp lệ.');
      await Linking.openURL(target);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không mở được thanh toán.');
    } finally {
      setBusy(false);
    }
  };
  const action = async (value: string) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      if (!content.trim()) throw new Error('Nhập kết quả, bằng chứng hoặc lý do.');
      await apiRequest(`/paid-maintenance-orders/${selected.id}/actions`, 'POST', {
        action: value,
        content,
      });
      setSelected(null);
      setContent('');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không cập nhật được đơn.');
    } finally {
      setBusy(false);
    }
  };
  if (!data.length) return null;
  const labels: Record<string, string> = {
    AWAITING_PAYMENT: 'Chờ thanh toán',
    FUNDED: 'Đã xác nhận tiền',
    IN_PROGRESS: 'Đang thực hiện',
    SUBMITTED: 'Chờ nghiệm thu',
    COMPLETED: 'Đã nghiệm thu',
    DISPUTED: 'Cần hỗ trợ',
  };
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Đơn bảo trì có phí</Text>
      <Text style={styles.note}>
        Thanh toán mở trong trình duyệt. Khi quay lại, tải lại để xem kết quả đã được xác minh.
      </Text>
      {data.map((order) => (
        <View key={order.id} style={styles.quote}>
          <Text style={styles.title}>
            {money(order.amount)} · {labels[order.status]}
          </Text>
          <Text style={styles.body}>{order.scope}</Text>
          {order.submittedResult && (
            <Text style={styles.body}>Bàn giao gần nhất: {order.submittedResult}</Text>
          )}
          {order.dueAt && <Text style={styles.muted}>Hạn thực hiện {dateTime(order.dueAt)}</Text>}
          {user?.role === 'customer' && order.status === 'AWAITING_PAYMENT' && (
            <Button
              label="Thanh toán đơn bảo trì"
              disabled={busy}
              onPress={() => void checkout(order.id)}
            />
          )}
          {user?.role === 'freelancer' && ['FUNDED', 'IN_PROGRESS'].includes(order.status) && (
            <Button
              label="Gửi kết quả bàn giao"
              onPress={() => {
                setSelected(order);
                setContent('');
              }}
            />
          )}
          {user?.role === 'customer' && order.status === 'SUBMITTED' && (
            <Button
              label="Kiểm tra và nghiệm thu"
              onPress={() => {
                setSelected(order);
                setContent('');
              }}
            />
          )}
          {order.status === 'COMPLETED' && (
            <Button
              label="Bảo trì của đơn này"
              onPress={() => router.push({ pathname: '/maintenance', params: { jobId: order.id } })}
            />
          )}
        </View>
      ))}
      {selected && (
        <View style={styles.quote}>
          <Text style={styles.title}>Cập nhật đơn bảo trì</Text>
          <TextInput
            accessibilityLabel="Kết quả hoặc căn cứ"
            multiline
            maxLength={8000}
            value={content}
            onChangeText={setContent}
            style={[styles.input, { minHeight: 100 }]}
          />
          {user?.role === 'customer' ? (
            <>
              <Button
                label="Nghiệm thu, ghi công nợ chờ 7 ngày"
                disabled={busy}
                onPress={() => void action('ACCEPT')}
              />
              <Button
                label="Cần chỉnh sửa"
                disabled={busy}
                onPress={() => void action('REVISION')}
              />
            </>
          ) : (
            <Button
              label="Gửi kết quả để khách kiểm tra"
              disabled={busy}
              onPress={() => void action('SUBMIT')}
            />
          )}
          <Button label="Đóng" disabled={busy} onPress={() => setSelected(null)} />
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Tải lại đơn bảo trì" onPress={() => void refresh().catch(() => {})} />
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  quote: { padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', gap: 10 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  body: { fontSize: 13, lineHeight: 22, color: COLORS.textPrimary },
  muted: { fontSize: 12, color: COLORS.textMuted },
  note: { fontSize: 12, lineHeight: 20, color: '#1E40AF' },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    minHeight: 46,
    color: COLORS.textPrimary,
  },
  button: {
    minHeight: 46,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  buttonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  error: { fontSize: 13, color: '#B91C1C' },
});
