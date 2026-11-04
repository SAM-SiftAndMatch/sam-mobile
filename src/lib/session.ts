import type { User } from '../types/domain';
export const SESSION_KEY = 'user_session';

export function publicUser(value: unknown): User {
  if (!value || typeof value !== 'object') throw new Error('Phiên đăng nhập không hợp lệ.');
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    !record.id.trim() ||
    typeof record.name !== 'string' ||
    !record.name.trim() ||
    typeof record.email !== 'string' ||
    !record.email.trim() ||
    typeof record.role !== 'string' ||
    !['customer', 'freelancer'].includes(record.role)
  )
    throw new Error('Phiên đăng nhập không hợp lệ.');
  const result: Record<string, unknown> = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
  };
  for (const key of ['avatar', 'currency', 'title', 'bio', 'location', 'company', 'premiumPlan']) {
    if (typeof record[key] === 'string') result[key] = record[key];
  }
  for (const key of [
    'rating',
    'hourlyRate',
    'totalSpent',
    'completedJobs',
    'reviewsCount',
    'totalEarnings',
  ]) {
    if (typeof record[key] === 'number' && Number.isFinite(record[key])) result[key] = record[key];
  }
  if (typeof record.isPremium === 'boolean') result.isPremium = record.isPremium;
  if (Array.isArray(record.skills))
    result.skills = record.skills.filter((skill) => typeof skill === 'string');
  if (Array.isArray(record.portfolio))
    result.portfolio = record.portfolio
      .filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.link === 'string',
      )
      .map(({ id, title, link }) => ({ id, title, link }));
  return result as unknown as User;
}

export interface SessionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}
/** Serialize writes so a slow profile save cannot restore a logged-out session. */
export function createSessionStorage(storage: SessionStorage) {
  let queue = Promise.resolve();
  return {
    async read(): Promise<User | null> {
      await queue;
      const raw = await storage.getItem(SESSION_KEY);
      return raw ? publicUser(JSON.parse(raw)) : null;
    },
    write(user: User | null): Promise<void> {
      const next = queue
        .catch(() => {})
        .then(async () => {
          if (user) await storage.setItem(SESSION_KEY, JSON.stringify(publicUser(user)));
          else await storage.removeItem(SESSION_KEY);
        });
      queue = next;
      return next;
    },
  };
}
