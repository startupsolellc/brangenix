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
      // Initialize generations to 0 for new guests
      setGuestGenerations(0);
    }
  }, [guestToken, setGuestToken, setGuestGenerations]);

  useEffect(() => {
    // Only check limit for guest users with a token
    // and when they have actually made some generations
    if (guestToken && guestGenerations > 0) {
      setIsOverLimit(guestGenerations >= GUEST_LIMIT);
    } else {
      setIsOverLimit(false);
    }
  }, [guestGenerations, guestToken]);

  const trackGeneration = () => {
    if (guestToken) {
      const currentGenerations = Number(guestGenerations) || 0;
      // Only increment if under limit
      if (currentGenerations < GUEST_LIMIT) {
        setGuestGenerations(currentGenerations + 1);
      }
    }
  };

  const resetGuestGenerations = () => {
    setGuestGenerations(0);
    setIsOverLimit(false);
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