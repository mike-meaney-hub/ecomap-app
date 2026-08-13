import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listActiveClients, getClient } from '../db/repositories/clients';

export function useActiveClients() {
  return useRealtimeQuery(listActiveClients, [], [], { table: 'clients' });
}

export function useClient(id: string | undefined) {
  return useRealtimeQuery(
    () => (id ? getClient(id) : Promise.resolve(undefined)),
    [id],
    undefined,
    id ? { table: 'clients', filter: `id=eq.${id}` } : null,
  );
}
