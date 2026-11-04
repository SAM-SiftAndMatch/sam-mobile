import { useCallback, useRef, useState } from 'react';
import { useChat } from './useChat';
import { useRequestGate } from '../../hooks/useRequestGate';
import { errorMessage } from '../../lib/errors';

export function useMessageComposer(roomId: string, userId: string) {
  const { sendMessage } = useChat();
  const gate = useRequestGate();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const attempt = useRef<{ text: string; id: string } | null>(null);
  const send = useCallback(async () => {
    const body = text.trim();
    if (!body || lock.current) return;
    lock.current = true;
    setSending(true);
    setError('');
    // Retain the id on retry, so a successful write followed by a failed refresh is idempotent.
    if (attempt.current?.text !== body)
      attempt.current = {
        text: body,
        id: `${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      };
    try {
      await sendMessage(roomId, body, attempt.current.id);
      if (gate.isActive()) {
        setText('');
        attempt.current = null;
      }
    } catch (cause) {
      if (gate.isActive()) setError(errorMessage(cause));
    } finally {
      lock.current = false;
      if (gate.isActive()) setSending(false);
    }
  }, [text, userId, roomId, sendMessage, gate]);
  return { text, setText, sending, error, setError, send };
}
