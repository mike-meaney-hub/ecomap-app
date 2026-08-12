import { useLiveQuery } from 'dexie-react-hooks';
import { listActiveFlags } from '../db/repositories/flags';

export function useFlags() {
  return useLiveQuery(listActiveFlags, [], []);
}
