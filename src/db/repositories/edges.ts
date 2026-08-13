import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import { edgeFromRow, edgeToRow, type EdgeRow } from '../supabaseMappers';
import type { EcomapEdge } from '../types';
import { assertVersionEditable } from './ecomapVersions';

export async function listActiveEdgesForVersion(versionId: string) {
  const rows = unwrap(
    await supabase
      .from('edges')
      .select('*')
      .eq('ecomap_version_id', versionId)
      .neq('status', 'archived')
      .order('created_at'),
  ) as EdgeRow[];
  return rows.map(edgeFromRow);
}

export async function createEdge(input: { ecomapVersionId: string; fromNodeId: string; toNodeId: string }) {
  await assertVersionEditable(input.ecomapVersionId);
  const now = new Date().toISOString();
  const edge: EcomapEdge = {
    id: crypto.randomUUID(),
    ecomapVersionId: input.ecomapVersionId,
    fromNodeId: input.fromNodeId,
    toNodeId: input.toNodeId,
    relationshipType: 'strong',
    direction: 'none',
    label: '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const ownerId = await requireUserId();
  unwrap(await supabase.from('edges').insert(edgeToRow(edge, ownerId)));
  return edge;
}

async function getEdge(id: string) {
  const rows = unwrap(await supabase.from('edges').select('*').eq('id', id)) as EdgeRow[];
  return rows[0] ? edgeFromRow(rows[0]) : undefined;
}

export async function updateEdge(
  id: string,
  changes: Partial<Pick<EcomapEdge, 'relationshipType' | 'direction' | 'label'>>,
) {
  const edge = await getEdge(id);
  if (!edge) return;
  await assertVersionEditable(edge.ecomapVersionId);
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (changes.relationshipType !== undefined) row.relationship_type = changes.relationshipType;
  if (changes.direction !== undefined) row.direction = changes.direction;
  if (changes.label !== undefined) row.label = changes.label;
  unwrap(await supabase.from('edges').update(row).eq('id', id));
}

export async function archiveEdge(id: string) {
  const edge = await getEdge(id);
  if (!edge) return;
  await assertVersionEditable(edge.ecomapVersionId);
  unwrap(await supabase.from('edges').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id));
}
