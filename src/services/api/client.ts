import { Platform } from 'react-native';
import type { User } from '../../types/domain';
export const apiMode = Boolean(process.env.EXPO_PUBLIC_API_URL);
const base = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '') + '/api/v1';
let token = '';
let current: User | null = null;
let generation = 0;
let refreshing: Promise<User | null> | null = null;
let sessionWork: Promise<void> = Promise.resolve();
const expiredListeners = new Set<() => void>();
export function onApiSessionExpired(listener: () => void) {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
}
function expire() {
  generation++;
  token = '';
  current = null;
  for (const listener of expiredListeners) listener();
}
function serializeSession<T>(work: () => Promise<T>): Promise<T> {
  const next = sessionWork.catch(() => {}).then(work);
  sessionWork = next.then(
    () => {},
    () => {},
  );
  return next;
}
interface Envelope<T> {
  code: number;
  result: T;
  message?: string;
}
interface AuthResult {
  accessToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
}
export function apiUser() {
  return current;
}
function headers(auth: boolean, access = token) {
  const result: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && access) result.Authorization = `Bearer ${access}`;
  if (Platform.OS !== 'web' && process.env.EXPO_PUBLIC_AUTH_ORIGIN)
    result.Origin = process.env.EXPO_PUBLIC_AUTH_ORIGIN;
  return result;
}
async function send<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  auth = true,
  access = token,
): Promise<{ status: number; value: Envelope<T> }> {
  if (!apiMode) throw new Error('Chức năng chưa khả dụng trong phiên hiện tại.');
  if (!__DEV__ && !base.startsWith('https://'))
    throw new Error('Kết nối không bảo mật. Vui lòng liên hệ hỗ trợ.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(base + path, {
      method,
      headers: headers(auth, access),
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    let value: Envelope<T>;
    try {
      value = await response.json();
    } catch {
      throw new Error('Máy chủ chưa phản hồi hợp lệ. Hãy thử lại.');
    }
    return { status: response.status, value };
  } finally {
    clearTimeout(timeout);
  }
}
function adopt(auth: AuthResult): User {
  if (!['CLIENT', 'FREELANCER'].includes(auth.role))
    throw new Error('Vui lòng dùng tài khoản khách hàng hoặc freelancer trên ứng dụng.');
  token = auth.accessToken;
  current = {
    id: auth.userId,
    name: auth.fullName,
    email: auth.email,
    role: auth.role === 'CLIENT' ? 'customer' : 'freelancer',
  };
  return current;
}
export async function restoreApiSession(expectedUserId = current?.id): Promise<User | null> {
  if (!apiMode) return null;
  if (refreshing) return refreshing;
  const epoch = generation;
  refreshing = (async () => {
    const { status, value } = await serializeSession(() =>
      send<AuthResult>('/auth/refresh', 'POST', undefined, false),
    );
    if (generation !== epoch) return null;
    if (status !== 200 || value.code !== 1000) {
      expire();
      return null;
    }
    if (expectedUserId && value.result.userId !== expectedUserId) {
      expire();
      return null;
    }
    return adopt(value.result);
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}
export async function apiRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const epoch = generation;
  let response = await send<T>(path, method, body);
  if (epoch !== generation) throw new Error('Phiên đăng nhập đã thay đổi.');
  if (response.status === 401 && current && !path.startsWith('/auth/')) {
    const restored = await restoreApiSession();
    if (epoch !== generation) throw new Error('Phiên đăng nhập đã thay đổi.');
    if (restored) response = await send<T>(path, method, body);
  }
  if (epoch !== generation) throw new Error('Phiên đăng nhập đã thay đổi.');
  if (response.status < 200 || response.status >= 300 || response.value.code !== 1000)
    throw new Error(response.value.message || 'Không thực hiện được yêu cầu. Vui lòng thử lại.');
  return response.value.result;
}
export async function apiLogin(email: string, password: string): Promise<User> {
  generation++;
  token = '';
  current = null;
  const epoch = generation;
  const { status, value } = await serializeSession(() =>
    send<AuthResult>('/auth/login', 'POST', { email, password }, false),
  );
  if (generation !== epoch) throw new Error('Phiên đăng nhập đã thay đổi.');
  if (status !== 200 || value.code !== 1000)
    throw new Error(value.message || 'Không đăng nhập được.');
  return adopt(value.result);
}
export async function apiRegister(body: unknown): Promise<User> {
  generation++;
  token = '';
  current = null;
  const epoch = generation;
  const { status, value } = await serializeSession(() =>
    send<AuthResult>('/auth/register', 'POST', body, false),
  );
  if (generation !== epoch) throw new Error('Phiên đăng nhập đã thay đổi.');
  if (status !== 200 || value.code !== 1000)
    throw new Error(value.message || 'Không đăng ký được.');
  return adopt(value.result);
}
export async function apiLogout() {
  const previous = token;
  generation++;
  token = '';
  current = null;
  await serializeSession(() => send('/auth/logout', 'POST', undefined, true, previous));
}
export function requestKey(): Promise<string> {
  return apiRequest<string>('/finance/request-key');
}
