import { useLiveQuery } from 'dexie-react-hooks';
import { listActiveNodesForVersion } from '../db/repositories/nodes';

export function useNodesForVersion(versionId: string | undefined) {
  return useLiveQuery(() => (versionId ? listActiveNodesForVersion(versionId) : []), [versionId], []);
}
