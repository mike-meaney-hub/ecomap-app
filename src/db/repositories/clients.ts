import { db } from '../schema';
import type { Client } from '../types';

export async function listActiveClients() {
  return db.clients.where('status').notEqual('archived').sortBy('createdAt');
}

export async function listArchivedClients() {
  return db.clients.where('status').equals('archived').sortBy('createdAt');
}

export async function getClient(id: string) {
  return db.clients.get(id);
}

export async function createClient(input: Pick<Client, 'displayName' | 'dobOrAgeBand' | 'caseReference' | 'assignedPractitioner'>) {
  const now = new Date().toISOString();
  const client: Client = {
    id: crypto.randomUUID(),
    ...input,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  await db.clients.add(client);
  return client;
}

export async function updateClient(id: string, changes: Partial<Omit<Client, 'id' | 'createdAt'>>) {
  await db.clients.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

export async function archiveClient(id: string) {
  await db.clients.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
}
