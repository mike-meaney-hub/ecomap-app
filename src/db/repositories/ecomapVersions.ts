import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import {
  versionFromRow,
  versionToRow,
  nodeFromRow,
  nodeToRow,
  edgeFromRow,
  edgeToRow,
  type EcomapVersionRow,
  type NodeRow,
  type EdgeRow,
} from '../supabaseMappers';
import type { EcomapVersion } from '../types';

export async function listActiveVersionsForClient(clientId: string) {
  const rows = unwrap(
    await supabase
      .from('ecomap_versions')
      .select('*')
      .eq('client_id', clientId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false }),
  ) as EcomapVersionRow[];
  return rows.map(versionFromRow);
}

export async function getVersion(id: string) {
  const rows = unwrap(await supabase.from('ecomap_versions').select('*').eq('id', id)) as EcomapVersionRow[];
  return rows[0] ? versionFromRow(rows[0]) : undefined;
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
  const ownerId = await requireUserId();
  unwrap(await supabase.from('ecomap_versions').insert(versionToRow(version, ownerId)));
  return version;
}

export async function updateVersionSummary(id: string, summaryNotes: string) {
  unwrap(
    await supabase
      .from('ecomap_versions')
      .update({ summary_notes: summaryNotes, updated_at: new Date().toISOString() })
      .eq('id', id),
  );
}

export async function finaliseVersion(id: string) {
  unwrap(
    await supabase
      .from('ecomap_versions')
      .update({ status: 'finalised', updated_at: new Date().toISOString() })
      .eq('id', id),
  );
}

export async function archiveVersion(id: string) {
  unwrap(
    await supabase
      .from('ecomap_versions')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id),
  );
}

/**
 * Finalised versions are fully read-only: no node/edge create, edit, or archive.
 * Every write path in nodes.ts/edges.ts calls this first — this is a fast,
 * clear-message app-level check; the database also enforces the same rule via
 * a trigger (fn_reject_write_if_version_finalised in supabase/migrations),
 * so this guard is belt-and-braces, not the only line of defence.
 */
export async function assertVersionEditable(versionId: string) {
  const version = await getVersion(versionId);
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
  const source = await getVersion(sourceVersionId);
  if (!source) throw new Error('Source version not found.');

  const ownerId = await requireUserId();
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
  unwrap(await supabase.from('ecomap_versions').insert(versionToRow(newVersion, ownerId)));

  const sourceNodeRows = unwrap(
    await supabase.from('nodes').select('*').eq('ecomap_version_id', sourceVersionId).neq('status', 'archived'),
  ) as NodeRow[];
  const sourceEdgeRows = unwrap(
    await supabase.from('edges').select('*').eq('ecomap_version_id', sourceVersionId).neq('status', 'archived'),
  ) as EdgeRow[];
  const sourceNodes = sourceNodeRows.map(nodeFromRow);
  const sourceEdges = sourceEdgeRows.map(edgeFromRow);

  const idMap = new Map<string, string>();
  const newNodes = sourceNodes.map((n) => {
    const newId = crypto.randomUUID();
    idMap.set(n.id, newId);
    return { ...n, id: newId, ecomapVersionId: newVersion.id, createdAt: now, updatedAt: now };
  });
  if (newNodes.length > 0) {
    unwrap(await supabase.from('nodes').insert(newNodes.map((n) => nodeToRow(n, ownerId))));
  }

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
  if (newEdges.length > 0) {
    unwrap(await supabase.from('edges').insert(newEdges.map((e) => edgeToRow(e, ownerId))));
  }

  return newVersion;
}
