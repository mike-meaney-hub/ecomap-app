import { supabase, unwrap } from '../lib/supabaseClient';
import {
  clientFromRow,
  versionFromRow,
  nodeFromRow,
  edgeFromRow,
  categoryFromRow,
  flagFromRow,
  relationshipColourFromRow,
  type ClientRow,
  type EcomapVersionRow,
  type NodeRow,
  type EdgeRow,
  type CategoryRow,
  type FlagRow,
  type RelationshipColourRow,
} from './supabaseMappers';

const SCHEMA_VERSION = 1; // supabase/migrations/0001_init.sql

export async function exportDatabaseBackup() {
  const [
    clientRows,
    versionRows,
    nodeRows,
    edgeRows,
    categoryRows,
    flagRows,
    relationshipColourRows,
  ] = await Promise.all([
    supabase.from('clients').select('*'),
    supabase.from('ecomap_versions').select('*'),
    supabase.from('nodes').select('*'),
    supabase.from('edges').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('flags').select('*'),
    supabase.from('relationship_colours').select('*'),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    clients: (unwrap(clientRows) as ClientRow[]).map(clientFromRow),
    ecomapVersions: (unwrap(versionRows) as EcomapVersionRow[]).map(versionFromRow),
    nodes: (unwrap(nodeRows) as NodeRow[]).map(nodeFromRow),
    edges: (unwrap(edgeRows) as EdgeRow[]).map(edgeFromRow),
    categories: (unwrap(categoryRows) as CategoryRow[]).map(categoryFromRow),
    flags: (unwrap(flagRows) as FlagRow[]).map(flagFromRow),
    relationshipColours: (unwrap(relationshipColourRows) as RelationshipColourRow[]).map(relationshipColourFromRow),
  };

  supabase.rpc('log_export_event').then(({ error }) => {
    if (error) console.error('Failed to log export event:', error.message);
  });

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecomap-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
