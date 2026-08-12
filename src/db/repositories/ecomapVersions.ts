import { db } from '../schema';
import type { EcomapVersion } from '../types';

export async function listActiveVersionsForClient(clientId: string) {
  const versions = await db.ecomapVersions.where('clientId').equals(clientId).sortBy('createdAt');
  return versions.filter((v) => v.status !== 'archived').reverse();
}

export async function getVersion(id: string) {
  return db.ecomapVersions.get(id);
}

export async function createVersion(clientId: string, versionLabel: string) {
  const now = new Date().toISOString();
  const version: EcomapVersion = {
    id: crypto.randomUUID(),
    clientId,
    dateOfAssessment: now.slice(0, 10),
    versionLabel,
    summaryNotes: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  await db.ecomapVersions.add(version);
  return version;
}

export async function updateVersionSummary(id: string, summaryNotes: string) {
  await db.ecomapVersions.update(id, { summaryNotes, updatedAt: new Date().toISOString() });
}

export async function finaliseVersion(id: string) {
  await db.ecomapVersions.update(id, { status: 'finalised', updatedAt: new Date().toISOString() });
}

export async function archiveVersion(id: string) {
  await db.ecomapVersions.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
}

/**
 * Finalised versions are fully read-only: no node/edge create, edit, or archive.
 * Every write path in nodes.ts/edges.ts calls this first.
 */
export async function assertVersionEditable(versionId: string) {
  const version = await db.ecomapVersions.get(versionId);
  if (!version) throw new Error('Ecomap version not found.');
  if (version.status === 'finalised') {
    throw new Error('This ecomap version is finalised and read-only.');
  }
}

/**
 * Duplicates a version's active nodes/edges into a fresh draft, so a finalised
 * version can be built on without ever being edited in place.
 */
export async function duplicateVersionAsNewDraft(sourceVersionId: string) {
  const source = await db.ecomapVersions.get(sourceVersionId);
  if (!source) throw new Error('Source version not found.');

  const now = new Date().toISOString();
  const newVersion: EcomapVersion = {
    id: crypto.randomUUID(),
    clientId: source.clientId,
    dateOfAssessment: now.slice(0, 10),
    versionLabel: `${source.versionLabel} (copy)`,
    summaryNotes: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  await db.ecomapVersions.add(newVersion);

  const sourceNodes = (await db.nodes.where('ecomapVersionId').equals(sourceVersionId).toArray()).filter(
    (n) => n.status !== 'archived',
  );
  const sourceEdges = (await db.edges.where('ecomapVersionId').equals(sourceVersionId).toArray()).filter(
    (e) => e.status !== 'archived',
  );

  const idMap = new Map<string, string>();
  const newNodes = sourceNodes.map((n) => {
    const newId = crypto.randomUUID();
    idMap.set(n.id, newId);
    return { ...n, id: newId, ecomapVersionId: newVersion.id, createdAt: now, updatedAt: now };
  });
  if (newNodes.length > 0) await db.nodes.bulkAdd(newNodes);

  const newEdges = sourceEdges
    .filter((e) => idMap.has(e.fromNodeId) && idMap.has(e.toNodeId))
    .map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      ecomapVersionId: newVersion.id,
      fromNodeId: idMap.get(e.fromNodeId)!,
      toNodeId: idMap.get(e.toNodeId)!,
      createdAt: now,
      updatedAt: now,
    }));
  if (newEdges.length > 0) await db.edges.bulkAdd(newEdges);

  return newVersion;
}
