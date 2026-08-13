import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listActiveVersionsForClient, getVersion } from '../db/repositories/ecomapVersions';

export function useVersionsForClient(clientId: string | undefined) {
  return useRealtimeQuery(
    () => (clientId ? listActiveVersionsForClient(clientId) : Promise.resolve([])),
    [clientId],
    [],
    clientId ? { table: 'ecomap_versions', filter: `client_id=eq.${clientId}` } : null,
  );
}

export function useEcomapVersion(id: string | undefined) {
  return useRealtimeQuery(
    () => (id ? getVersion(id) : Promise.resolve(undefined)),
    [id],
    undefined,
    id ? { table: 'ecomap_versions', filter: `id=eq.${id}` } : null,
  );
}
