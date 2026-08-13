import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listActiveNodesForVersion } from '../db/repositories/nodes';

export function useNodesForVersion(versionId: string | undefined) {
  return useRealtimeQuery(
    () => (versionId ? listActiveNodesForVersion(versionId) : Promise.resolve([])),
    [versionId],
    [],
    versionId ? { table: 'nodes', filter: `ecomap_version_id=eq.${versionId}` } : null,
  );
}
