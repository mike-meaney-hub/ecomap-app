import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import { categoryFromRow, categoryToRow, type CategoryRow } from '../supabaseMappers';
import type { Category } from '../types';

export async function listActiveCategories() {
  const rows = unwrap(
    await supabase.from('categories').select('*').neq('status', 'archived').order('sort_order'),
  ) as CategoryRow[];
  return rows.map(categoryFromRow);
}

export async function createCategory(name: string) {
  const rows = unwrap(
    await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1),
  ) as CategoryRow[];
  const maxSortOrder = rows[0]?.sort_order ?? -1;

  const now = new Date().toISOString();
  const category: Category = {
    id: crypto.randomUUID(),
    name,
    sortOrder: maxSortOrder + 1,
    isDefault: false,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const ownerId = await requireUserId();
  unwrap(await supabase.from('categories').insert(categoryToRow(category, ownerId)));
  return category;
}

export async function renameCategory(id: string, name: string) {
  unwrap(await supabase.from('categories').update({ name, updated_at: new Date().toISOString() }).eq('id', id));
}

export async function reorderCategory(id: string, sortOrder: number) {
  unwrap(
    await supabase.from('categories').update({ sort_order: sortOrder, updated_at: new Date().toISOString() }).eq('id', id),
  );
}

export async function archiveCategory(id: string) {
  unwrap(
    await supabase.from('categories').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id),
  );
}
