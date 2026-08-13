import { db } from './schema';

export async function exportDatabaseBackup() {
  const [clients, ecomapVersions, nodes, edges, categories, flags, relationshipColours] = await Promise.all([
    db.clients.toArray(),
    db.ecomapVersions.toArray(),
    db.nodes.toArray(),
    db.edges.toArray(),
    db.categories.toArray(),
    db.flags.toArray(),
    db.relationshipColours.toArray(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    schemaVersion: db.verno,
    clients,
    ecomapVersions,
    nodes,
    edges,
    categories,
    flags,
    relationshipColours,
  };

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
