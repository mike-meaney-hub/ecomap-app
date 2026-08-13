import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';

interface Subscription {
  table: string;
  filter?: string;
}

/**
 * A minimal replacement for dexie-react-hooks' useLiveQuery, preserving the
 * same ergonomics (default value while loading, no flicker) but backed by
 * Supabase: fetches queryFn() on mount/dep change, then re-fetches whenever a
 * matching Postgres change is broadcast over Realtime. This is what upgrades
 * the app's previous cross-tab reactivity (via IndexedDB) into genuine
 * cross-device reactivity — a write from any device triggers every other
 * subscribed client's refetch.
 *
 * Deliberately not a general-purpose cache (no TanStack Query): this is a
 * small single-user app, and each hook instance owning its own fetch +
 * channel keeps the 7 call sites in src/hooks/*.ts a near-identical shape to
 * what they were before.
 */
export function useRealtimeQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[],
  defaultValue: T,
  subscribe: Subscription | null,
): T {
  const [value, setValue] = useState<T>(defaultValue);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  // Supabase's channel() reuses an existing channel object when called again
  // with the same topic name, and calling .on() on a channel that's already
  // been .subscribe()'d throws. Two mounted hook instances querying the same
  // table (e.g. the canvas and an inline edge editor both reading
  // relationship_colours at once) would otherwise collide on an identical
  // topic — so each hook instance gets its own unique topic suffix.
  const instanceIdRef = useRef(crypto.randomUUID());

  useEffect(() => {
    let cancelled = false;

    function refetch() {
      queryFnRef.current().then((result) => {
        if (!cancelled) setValue(result);
      });
    }

    refetch();

    if (!subscribe) {
      return () => {
        cancelled = true;
      };
    }

    const channel = supabase
      .channel(`realtime:${subscribe.table}:${subscribe.filter ?? 'all'}:${instanceIdRef.current}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: subscribe.table, filter: subscribe.filter },
        refetch,
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, subscribe?.table, subscribe?.filter]);

  return value;
}
