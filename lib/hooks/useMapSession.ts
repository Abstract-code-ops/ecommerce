'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { mapProvider } from '@/lib/maps';

/**
 * Hook for managing Mapbox search sessions
 * Session tokens group multiple search requests into a single billable event
 * This significantly reduces API costs
 */
export function useMapSession() {
  const [sessionToken, setSessionToken] = useState<string>('');
  const sessionStartTimeRef = useRef<number>(0);
  const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  // Create a new session
  const createSession = useCallback(() => {
    const token = mapProvider.createSession();
    setSessionToken(token);
    sessionStartTimeRef.current = Date.now();
    return token;
  }, []);

  // End current session (usually after user selects a location)
  const endSession = useCallback(() => {
    setSessionToken('');
    sessionStartTimeRef.current = 0;
  }, []);

  // Get current session token or create new one
  const getSessionToken = useCallback(() => {
    const now = Date.now();
    const elapsed = now - sessionStartTimeRef.current;

    // If session expired or doesn't exist, create new one
    if (!sessionToken || elapsed > SESSION_TIMEOUT) {
      return createSession();
    }

    return sessionToken;
  }, [sessionToken, createSession]);

  // Auto-expire old sessions
  useEffect(() => {
    if (!sessionToken) return;

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTimeRef.current;
      if (elapsed > SESSION_TIMEOUT) {
        endSession();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [sessionToken, endSession]);

  return {
    sessionToken,
    createSession,
    endSession,
    getSessionToken,
  };
}
