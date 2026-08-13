import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listActiveEdgesForVersion } from '../db/repositories/edges';

export function useEdgesForVersion(versionId: string | undefined) {
  return useRealtimeQuery(
    () => (versionId ? listActiveEdgesForVersion(versionId) : Promise.resolve([])),
    [versionId],
    [],
    versionId ? { table: 'edges', filter: `ecomap_version_id=eq.${versionId}` } : null,
  );
}
