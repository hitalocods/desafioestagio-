'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'novastore_cart_session_id';

function generateClientUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      stored = generateClientUuid();
      window.localStorage.setItem(STORAGE_KEY, stored);
    }
    setSessionId(stored);
  }, []);

  return sessionId;
}

