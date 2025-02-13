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
    // Initialize guest token if not exists, but don't reset generations
    if (!guestToken) {
      setGuestToken(uuidv4());
    }
  }, [guestToken, setGuestToken]);

  useEffect(() => {
    // Only check limit for guest users with a token
    if (guestToken) {
      const currentGenerations = Number(guestGenerations) || 0;
      setIsOverLimit(currentGenerations >= GUEST_LIMIT);
    }
  }, [guestGenerations, guestToken]);

  const trackGeneration = () => {
    if (guestToken) {
      const currentGenerations = Number(guestGenerations) || 0;
      if (currentGenerations < GUEST_LIMIT) {
        setGuestGenerations(currentGenerations + 1);
      }
    }
  };

  const resetGuestGenerations = () => {
    setGuestGenerations(0);
  };

  return {
    guestToken,
    guestGenerations: Number(guestGenerations) || 0,
    isOverLimit,
    trackGeneration,
    resetGuestGenerations,
    GUEST_LIMIT
  };
}