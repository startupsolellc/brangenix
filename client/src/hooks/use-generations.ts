import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const GUEST_TOKEN_KEY = 'guest_token';
const GUEST_GENERATIONS_KEY = 'guest_generations';
const GUEST_LIMIT = 5;

export function useGenerations() {
  const [guestToken, setGuestToken] = useLocalStorage<string>(GUEST_TOKEN_KEY, '');
  const [guestGenerations, setGuestGenerations] = useLocalStorage<number>(GUEST_GENERATIONS_KEY, 0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    // Initialize guest token if not exists
    if (!guestToken) {
      setGuestToken(uuidv4());
    }
  }, [guestToken, setGuestToken]);

  useEffect(() => {
    // Check if guest user is over limit
    if (!guestToken) return;

    setIsOverLimit(guestGenerations >= GUEST_LIMIT);
  }, [guestGenerations, guestToken]);

  const trackGeneration = () => {
    if (guestToken) {
      setGuestGenerations((prev: number) => prev + 1);
    }
  };

  const resetGuestGenerations = () => {
    setGuestGenerations(0);
  };

  return {
    guestToken,
    guestGenerations,
    isOverLimit,
    trackGeneration,
    resetGuestGenerations,
    GUEST_LIMIT
  };
}