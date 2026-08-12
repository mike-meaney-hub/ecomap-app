import { useLiveQuery } from 'dexie-react-hooks';
import { listActiveClients, getClient } from '../db/repositories/clients';

export function useActiveClients() {
  return useLiveQuery(listActiveClients, [], []);
}

export function useClient(id: string | undefined) {
  return useLiveQuery(() => (id ? getClient(id) : undefined), [id]);
}
