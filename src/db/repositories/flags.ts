import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import { flagFromRow, flagToRow, type FlagRow } from '../supabaseMappers';
import type { ColourFlag } from '../types';

export async function listActiveFlags() {
  const rows = unwrap(
    await supabase.from('flags').select('*').neq('status', 'archived').order('sort_order'),
  ) as FlagRow[];
  return rows.map(flagFromRow);
}

export async function createFlag(name: string, colour: string) {
  const rows = unwrap(
    await supabase.from('flags').select('sort_order').order('sort_order', { ascending: false }).limit(1),
  ) as FlagRow[];
  const maxSortOrder = rows[0]?.sort_order ?? -1;

  const now = new Date().toISOString();
  const flag: ColourFlag = {
    id: crypto.randomUUID(),
    name,
    colour,
    sortOrder: maxSortOrder + 1,
    isDefault: false,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const ownerId = await requireUserId();
  unwrap(await supabase.from('flags').insert(flagToRow(flag, ownerId)));
  return flag;
}

export async function renameFlag(id: string, name: string, colour: string) {
  unwrap(await supabase.from('flags').update({ name, colour, updated_at: new Date().toISOString() }).eq('id', id));
}

export async function reorderFlag(id: string, sortOrder: number) {
  unwrap(
    await supabase.from('flags').update({ sort_order: sortOrder, updated_at: new Date().toISOString() }).eq('id', id),
  );
}

export async function archiveFlag(id: string) {
  unwrap(await supabase.from('flags').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id));
}
