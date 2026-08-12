import { db } from '../schema';
import type { EcomapNode } from '../types';
import { assertVersionEditable } from './ecomapVersions';

export async function listActiveNodesForVersion(versionId: string) {
  const nodes = await db.nodes.where('ecomapVersionId').equals(versionId).sortBy('createdAt');
  return nodes.filter((n) => n.status !== 'archived');
}

export async function getNode(id: string) {
  return db.nodes.get(id);
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
  await db.nodes.add(node);
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
  await db.nodes.add(node);
  return node;
}

export async function updateNodePosition(id: string, x: number, y: number) {
  const node = await db.nodes.get(id);
  if (!node) return;
  await assertVersionEditable(node.ecomapVersionId);
  await db.nodes.update(id, { x, y, updatedAt: new Date().toISOString() });
}

export async function updateNode(
  id: string,
  changes: Partial<Pick<EcomapNode, 'label' | 'categoryId' | 'flagId' | 'notes'>>,
) {
  const node = await db.nodes.get(id);
  if (!node) return;
  await assertVersionEditable(node.ecomapVersionId);
  await db.nodes.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

export async function archiveNode(id: string) {
  const node = await db.nodes.get(id);
  if (!node || node.isCentral) return;
  await assertVersionEditable(node.ecomapVersionId);
  await db.nodes.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
}
