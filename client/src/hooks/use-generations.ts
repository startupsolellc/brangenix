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

  // Initialize new guest users
  useEffect(() => {
    if (!guestToken) {
      // Generate new guest token for first-time visitors
      setGuestToken(uuidv4());
      // Explicitly set initial generations to 0
      setGuestGenerations(0);
      setIsOverLimit(false);
    }
  }, [guestToken, setGuestToken, setGuestGenerations]);

  // Handle limit checking
  useEffect(() => {
    if (guestToken) {
      const currentGenerations = Number(guestGenerations);
      // Only set over limit if they've actually used generations
      setIsOverLimit(currentGenerations > 0 && currentGenerations >= GUEST_LIMIT);
    }
  }, [guestGenerations, guestToken]);

  const trackGeneration = () => {
    if (guestToken) {
      const currentGenerations = Number(guestGenerations);
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
    guestGenerations: Number(guestGenerations),
    isOverLimit,
    trackGeneration,
    resetGuestGenerations,
    GUEST_LIMIT
  };
}