import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { repository } from '../../services/repository';
import type { Registration, User } from '../../types/domain';
import { useRequestGate } from '../../hooks/useRequestGate';
import { errorMessage } from '../../lib/errors';
import { createSessionStorage } from '../../lib/session';

const sessions = createSessionStorage(AsyncStorage);
interface AuthState {
  user: User | null;
  role: User['role'];
  sessionId: number;
  initializing: boolean;
  isLoading: boolean;
  authError: string | null;
  login(email: string, password: string): Promise<User>;
  register(data: Registration): Promise<User>;
  logout(): Promise<void>;
  updateProfile(data: Partial<User>): Promise<User | undefined>;
}
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const gate = useRequestGate();
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [authError, setError] = useState<string | null>(null);

  useEffect(() => {
    const ticket = gate.begin('restore');
    void sessions
      .read()
      .then(async (stored) => {
        if (!gate.isCurrent(ticket)) return;
        if (stored) await sessions.write(stored); // migrate old credential-bearing mock sessions
        if (gate.isCurrent(ticket)) setUser(stored);
      })
      .catch(async (cause) => {
        if (!gate.isCurrent(ticket)) return;
        setError(errorMessage(cause));
        await sessions.write(null).catch(() => {});
      })
      .finally(() => {
        if (gate.isCurrent(ticket)) setInitializing(false);
      });
  }, [gate]);

  const authenticate = useCallback(
    async (request: () => Promise<User>) => {
      gate.activate(); // invalidate restore/profile/auth requests from the previous session
      const ticket = gate.begin('auth');
      setLoading(true);
      setError(null);
      try {
        const next = await request();
        if (!gate.isCurrent(ticket)) throw new Error('Phiên đăng nhập đã thay đổi.');
        await sessions.write(next);
        if (!gate.isCurrent(ticket)) throw new Error('Phiên đăng nhập đã thay đổi.');
        setUser(next);
        setSessionId((value) => value + 1);
        return next;
      } catch (cause) {
        if (gate.isCurrent(ticket)) setError(errorMessage(cause));
        throw cause;
      } finally {
        if (gate.isCurrent(ticket)) setLoading(false);
      }
    },
    [gate],
  );
  const login = useCallback(
    (email: string, password: string) => authenticate(() => repository.auth.login(email, password)),
    [authenticate],
  );
  const register = useCallback(
    (data: Registration) => authenticate(() => repository.auth.register(data)),
    [authenticate],
  );
  const logout = useCallback(async () => {
    gate.activate();
    setUser(null);
    setSessionId((value) => value + 1);
    setLoading(false);
    setError(null);
    await sessions.write(null);
  }, [gate]);
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) return;
      const ticket = gate.begin('profile');
      const next = await repository.auth.updateProfile(user.id, data);
      if (!gate.isCurrent(ticket)) return;
      await sessions.write(next);
      if (!gate.isCurrent(ticket)) return;
      setUser(next);
      return next;
    },
    [gate, user],
  );
  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? ('freelancer' as const),
      sessionId,
      initializing,
      isLoading,
      authError,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, sessionId, initializing, isLoading, authError, login, register, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
