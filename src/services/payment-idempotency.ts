export function paymentScope(path: string, method: string, body: unknown): string | null {
  if (method.toUpperCase() !== 'POST') return null;
  let value: Record<string, unknown> = {};
  try {
    value = typeof body === 'string' ? JSON.parse(body) : (body as Record<string, unknown>) || {};
  } catch {
    return null;
  }
  if (path === '/subscriptions/purchase')
    return `${path}:${String(value.packageId)}:${String(value.projectId || '')}`;
  if (path === '/payments/fund' || path === '/payments/deposit')
    return `${path}:${String(value.contractId)}`;
  if (/^\/jobs\/[a-f0-9-]{36}\/addons\/checkout$/i.test(path)) return path;
  if (/^\/paid-maintenance-orders\/[a-f0-9-]{36}\/checkout$/i.test(path)) return path;
  return null;
}
