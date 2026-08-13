import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listActiveCategories } from '../db/repositories/categories';

export function useCategories() {
  return useRealtimeQuery(listActiveCategories, [], [], { table: 'categories' });
}
