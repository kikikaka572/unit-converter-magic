import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseBroadcastChannelOptions {
  channelName: string;
  onMessage: (event: string, payload: unknown) => void;
  presenceData?: Record<string, unknown>;
  presenceKey?: string;
}

interface UseBroadcastChannelReturn {
  broadcast: (event: string, payload: unknown) => Promise<void>;
  presenceState: Record<string, unknown[]>;
  isConnected: boolean;
  connectionError: string | null;
}

export const useBroadcastChannel = (
  options: UseBroadcastChannelOptions
): UseBroadcastChannelReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [presenceState, setPresenceState] = useState<Record<string, unknown[]>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onMessageRef = useRef(options.onMessage);
  const presenceDataRef = useRef(options.presenceData);

  useEffect(() => { onMessageRef.current = options.onMessage; }, [options.onMessage]);
  useEffect(() => { presenceDataRef.current = options.presenceData; }, [options.presenceData]);

  useEffect(() => {
    if (!options.channelName) return;

    const ch = supabase.channel(options.channelName, {
      config: { broadcast: { self: false }, presence: { key: options.presenceKey ?? '' } },
    });

    ch.on('broadcast', { event: '*' }, ({ event, payload }) => {
      onMessageRef.current(event, payload);
    });

    if (options.presenceData !== undefined) {
      ch.on('presence', { event: 'sync' }, () => {
        setPresenceState(ch.presenceState() as Record<string, unknown[]>);
      });
      ch.on('presence', { event: 'join' }, () => {
        setPresenceState(ch.presenceState() as Record<string, unknown[]>);
      });
      ch.on('presence', { event: 'leave' }, () => {
        setPresenceState(ch.presenceState() as Record<string, unknown[]>);
      });
    }

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setConnectionError(null);
        if (presenceDataRef.current !== undefined) {
          await ch.track(presenceDataRef.current);
        }
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        setConnectionError('connection_error');
      }
    });

    channelRef.current = ch;

    return () => {
      supabase.removeChannel(ch);
      setIsConnected(false);
    };
  }, [options.channelName]); // eslint-disable-line react-hooks/exhaustive-deps

  const broadcast = useCallback(async (event: string, payload: unknown) => {
    if (!channelRef.current) return;
    await channelRef.current.send({ type: 'broadcast', event, payload });
  }, []);

  return { broadcast, presenceState, isConnected, connectionError };
};
