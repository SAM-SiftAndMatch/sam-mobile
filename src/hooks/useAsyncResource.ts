import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../lib/errors';
import { useRequestGate } from './useRequestGate';

/** The load function must be stable. A failed refresh retains the last successful data. */
export function useAsyncResource<T>(load: () => Promise<T>, initialData: T) {
  const gate = useRequestGate();
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const execute = useCallback(
    async (ticket: ReturnType<typeof gate.begin>) => {
      try {
        const next = await load();
        if (gate.isCurrent(ticket)) {
          setData(next);
          setError(null);
        }
        return next;
      } catch (cause) {
        if (gate.isCurrent(ticket)) setError(errorMessage(cause));
        throw cause;
      } finally {
        if (gate.isCurrent(ticket)) setLoading(false);
      }
    },
    [gate, load],
  );
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    return execute(gate.begin());
  }, [gate, execute]);
  useEffect(() => {
    const ticket = gate.begin();
    void load().then(
      (next) => {
        if (gate.isCurrent(ticket)) {
          setData(next);
          setError(null);
          setLoading(false);
        }
      },
      (cause) => {
        if (gate.isCurrent(ticket)) {
          setError(errorMessage(cause));
          setLoading(false);
        }
      },
    );
  }, [gate, load]);
  return { data, setData, loading, error, refresh };
}
