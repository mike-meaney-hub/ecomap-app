import { useLiveQuery } from 'dexie-react-hooks';
import { listActiveVersionsForClient, getVersion } from '../db/repositories/ecomapVersions';

export function useVersionsForClient(clientId: string | undefined) {
  return useLiveQuery(() => (clientId ? listActiveVersionsForClient(clientId) : []), [clientId], []);
}

export function useEcomapVersion(id: string | undefined) {
  return useLiveQuery(() => (id ? getVersion(id) : undefined), [id]);
}
