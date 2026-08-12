import { useLiveQuery } from 'dexie-react-hooks';
import { listActiveEdgesForVersion } from '../db/repositories/edges';

export function useEdgesForVersion(versionId: string | undefined) {
  return useLiveQuery(() => (versionId ? listActiveEdgesForVersion(versionId) : []), [versionId], []);
}
