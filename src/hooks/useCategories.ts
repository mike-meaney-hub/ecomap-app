import { useLiveQuery } from 'dexie-react-hooks';
import { listActiveCategories } from '../db/repositories/categories';

export function useCategories() {
  return useLiveQuery(listActiveCategories, [], []);
}
