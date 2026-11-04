import { useCallback, useState } from 'react';
import { useRequestGate } from './useRequestGate';
import { errorMessage } from '../lib/errors';
/** Tracks overlapping mutations independently of initial resource loading. */
export function useAsyncAction() {
  const gate = useRequestGate();
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      setPending((count) => count + 1);
      setError(null);
      try {
        return await operation();
      } catch (cause) {
        if (gate.isActive()) setError(errorMessage(cause));
        throw cause;
      } finally {
        if (gate.isActive()) setPending((count) => count - 1);
      }
    },
    [gate],
  );
  const clearError = useCallback(() => setError(null), []);
  return { run, pending: pending > 0, error, clearError, isActive: gate.isActive };
}
