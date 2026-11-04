import { useEffect, useState } from 'react';
import { createRequestGate } from '../lib/requestGate';
export function useRequestGate() {
  const [gate] = useState(createRequestGate);
  useEffect(() => {
    gate.activate();
    return () => gate.dispose();
  }, [gate]);
  return gate;
}
