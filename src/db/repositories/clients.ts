import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import { clientFromRow, clientToRow, type ClientRow } from '../supabaseMappers';
import type { Client } from '../types';

export async function listActiveClients() {
  const rows = unwrap(
    await supabase.from('clients').select('*').neq('status', 'archived').order('created_at'),
  ) as ClientRow[];
  return rows.map(clientFromRow);
}

export async function listArchivedClients() {
  const rows = unwrap(
    await supabase.from('clients').select('*').eq('status', 'archived').order('created_at'),
  ) as ClientRow[];
  return rows.map(clientFromRow);
}

export async function getClient(id: string) {
  const rows = unwrap(await supabase.from('clients').select('*').eq('id', id)) as ClientRow[];
  return rows[0] ? clientFromRow(rows[0]) : undefined;
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
  const ownerId = await requireUserId();
  unwrap(await supabase.from('clients').insert(clientToRow(client, ownerId)));
  return client;
}

export async function updateClient(id: string, changes: Partial<Omit<Client, 'id' | 'createdAt'>>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (changes.displayName !== undefined) row.display_name = changes.displayName;
  if (changes.dobOrAgeBand !== undefined) row.dob_or_age_band = changes.dobOrAgeBand;
  if (changes.caseReference !== undefined) row.case_reference = changes.caseReference;
  if (changes.assignedPractitioner !== undefined) row.assigned_practitioner = changes.assignedPractitioner;
  if (changes.status !== undefined) row.status = changes.status;
  unwrap(await supabase.from('clients').update(row).eq('id', id));
}

export async function archiveClient(id: string) {
  unwrap(await supabase.from('clients').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id));
}
