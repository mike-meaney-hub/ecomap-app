import { db } from '../schema';
import type { EcomapEdge } from '../types';
import { assertVersionEditable } from './ecomapVersions';

export async function listActiveEdgesForVersion(versionId: string) {
  const edges = await db.edges.where('ecomapVersionId').equals(versionId).sortBy('createdAt');
  return edges.filter((e) => e.status !== 'archived');
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
  await db.edges.add(edge);
  return edge;
}

export async function updateEdge(
  id: string,
  changes: Partial<Pick<EcomapEdge, 'relationshipType' | 'direction' | 'label'>>,
) {
  const edge = await db.edges.get(id);
  if (!edge) return;
  await assertVersionEditable(edge.ecomapVersionId);
  await db.edges.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

export async function archiveEdge(id: string) {
  const edge = await db.edges.get(id);
  if (!edge) return;
  await assertVersionEditable(edge.ecomapVersionId);
  await db.edges.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
}
