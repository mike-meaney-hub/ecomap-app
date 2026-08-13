import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listActiveFlags } from '../db/repositories/flags';

export function useFlags() {
  return useRealtimeQuery(listActiveFlags, [], [], { table: 'flags' });
}
