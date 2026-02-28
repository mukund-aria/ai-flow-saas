/**
 * useRealtimeUpdates Hook
 *
 * Connects to the SSE endpoint for real-time flow run updates.
 * Auto-reconnects with exponential backoff on disconnection.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface UseRealtimeUpdatesOptions {
  onRunUpdated?: (data: any) => void;
  onStepCompleted?: (data: any) => void;
  onRunStarted?: (data: any) => void;
  onRunCompleted?: (data: any) => void;
}

export function useRealtimeUpdates(options?: UseRealtimeUpdatesOptions): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${API_BASE}/events`, { withCredentials: true });
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      setConnected(true);
      retryCountRef.current = 0; // Reset backoff on successful connection
    });

    es.addEventListener('run.updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current?.onRunUpdated?.(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('step.completed', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current?.onStepCompleted?.(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('run.started', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current?.onRunStarted?.(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('run.completed', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current?.onRunCompleted?.(data);
      } catch { /* ignore parse errors */ }
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      eventSourceRef.current = null;

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30_000);
      retryCountRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  return { connected };
}
