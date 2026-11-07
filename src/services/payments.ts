import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { apiRequest, apiUser } from './api/client';
export interface Checkout {
  orderId: string;
  purpose: string;
  objectId: string;
  amount: number;
  environment: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  checkoutUrl?: string | null;
  transferContent: string;
  supportCode?: string;
  reviewRequired?: boolean;
  createdAt?: string;
  paidAt?: string | null;
}
export function normalizeCheckoutId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(id)) return null;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`.toLowerCase();
}
export function paymentLabel(order: Checkout) {
  if (order.paymentStatus === 'PAID')
    return order.fulfillmentStatus === 'APPLIED'
      ? 'Đã thanh toán và kích hoạt'
      : order.fulfillmentStatus === 'REVIEW'
        ? 'Đã nhận tiền, cần hỗ trợ'
        : 'Đã thanh toán, đang kích hoạt';
  return (
    (
      {
        PENDING: 'Chờ thanh toán',
        CREATING: 'Đang tạo thanh toán',
        UNKNOWN: 'Đang kiểm tra giao dịch',
        EXPIRED: 'Liên kết hết hạn',
        CANCELLED: 'Đã hủy',
        REVIEW: 'Cần đối soát',
      } as Record<string, string>
    )[order.paymentStatus] || 'Đang kiểm tra'
  );
}
export async function openPayment(checkout: {
  orderId?: string | null;
  checkoutUrl?: string | null;
}) {
  const id = normalizeCheckoutId(checkout.orderId);
  const owner = apiUser()?.id;
  if (!id || !owner) throw new Error('Chưa có mã đơn thanh toán hoặc phiên đăng nhập.');
  if (checkout.checkoutUrl) {
    const url = new URL(checkout.checkoutUrl);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      (url.port && url.port !== '443') ||
      !['payment.pay2s.vn', 'sandbox-payment.pay2s.vn'].includes(url.hostname)
    )
      throw new Error('Liên kết thanh toán không hợp lệ.');
  }
  await AsyncStorage.setItem(`sam:checkout:${owner}`, id);
  if (apiUser()?.id !== owner) return;
  router.push({ pathname: '/payment-return', params: { orderId: id } });
  if (checkout.checkoutUrl) await Linking.openURL(checkout.checkoutUrl);
}
export const payments = {
  get: (id: string) => apiRequest<Checkout>(`/checkouts/${id}`),
  history: (page = 0) => apiRequest<Checkout[]>(`/checkouts/me?page=${page}`),
};
