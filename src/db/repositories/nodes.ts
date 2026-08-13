import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import { nodeFromRow, nodeToRow, type NodeRow } from '../supabaseMappers';
import type { EcomapNode } from '../types';
import { assertVersionEditable } from './ecomapVersions';

export async function listActiveNodesForVersion(versionId: string) {
  const rows = unwrap(
    await supabase
      .from('nodes')
      .select('*')
      .eq('ecomap_version_id', versionId)
      .neq('status', 'archived')
      .order('created_at'),
  ) as NodeRow[];
  return rows.map(nodeFromRow);
}

export async function getNode(id: string) {
  const rows = unwrap(await supabase.from('nodes').select('*').eq('id', id)) as NodeRow[];
  return rows[0] ? nodeFromRow(rows[0]) : undefined;
}

export async function createCentralNode(versionId: string, label: string) {
  const now = new Date().toISOString();
  const node: EcomapNode = {
    id: crypto.randomUUID(),
    ecomapVersionId: versionId,
    label,
    categoryId: null,
    flagId: null,
    x: 0,
    y: 0,
    notes: '',
    isCentral: true,
    isHouseholdMember: true,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const ownerId = await requireUserId();
  unwrap(await supabase.from('nodes').insert(nodeToRow(node, ownerId)));
  return node;
}

export async function createNode(input: {
  ecomapVersionId: string;
  label: string;
  categoryId: string;
  x: number;
  y: number;
  isHouseholdMember?: boolean;
}) {
  await assertVersionEditable(input.ecomapVersionId);
  const now = new Date().toISOString();
  const node: EcomapNode = {
    id: crypto.randomUUID(),
    ecomapVersionId: input.ecomapVersionId,
    label: input.label,
    categoryId: input.categoryId,
    flagId: null,
    x: input.x,
    y: input.y,
    notes: '',
    isCentral: false,
    isHouseholdMember: input.isHouseholdMember ?? false,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const ownerId = await requireUserId();
  unwrap(await supabase.from('nodes').insert(nodeToRow(node, ownerId)));
  return node;
}

export async function updateNodePosition(id: string, x: number, y: number) {
  const node = await getNode(id);
  if (!node) return;
  await assertVersionEditable(node.ecomapVersionId);
  unwrap(await supabase.from('nodes').update({ x, y, updated_at: new Date().toISOString() }).eq('id', id));
}

export async function updateNode(
  id: string,
  changes: Partial<Pick<EcomapNode, 'label' | 'categoryId' | 'flagId' | 'notes'>>,
) {
  const node = await getNode(id);
  if (!node) return;
  await assertVersionEditable(node.ecomapVersionId);
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (changes.label !== undefined) row.label = changes.label;
  if (changes.categoryId !== undefined) row.category_id = changes.categoryId;
  if (changes.flagId !== undefined) row.flag_id = changes.flagId;
  if (changes.notes !== undefined) row.notes = changes.notes;
  unwrap(await supabase.from('nodes').update(row).eq('id', id));
}

export async function archiveNode(id: string) {
  const node = await getNode(id);
  if (!node || node.isCentral) return;
  await assertVersionEditable(node.ecomapVersionId);
  unwrap(await supabase.from('nodes').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id));
}
