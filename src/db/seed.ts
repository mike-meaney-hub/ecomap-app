import { supabase, requireUserId, unwrap } from '../lib/supabaseClient';
import { categoryToRow, flagToRow, relationshipColourToRow } from './supabaseMappers';
import type { RelationshipType } from './types';

const DEFAULT_RELATIONSHIP_COLOURS: { relationshipType: RelationshipType; colour: string }[] = [
  { relationshipType: 'strong', colour: '#16a34a' },
  { relationshipType: 'weak', colour: '#9ca3af' },
  { relationshipType: 'stressful', colour: '#dc2626' },
  { relationshipType: 'absent', colour: '#d1d5db' },
];

const DEFAULT_CATEGORIES = [
  'Family',
  'Friend',
  'Health',
  'Education',
  'Employment',
  'Statutory / social services',
  'Faith / community',
  'Housing',
  'Financial',
  'Legal',
  'Other',
];

const DEFAULT_FLAGS: { name: string; colour: string }[] = [
  { name: 'Immediate family', colour: '#f5c518' },
  { name: 'Inner circle / trusted', colour: '#3b82f6' },
  { name: 'Source of risk / concern', colour: '#dc2626' },
  { name: 'Inactive / historical', colour: '#9ca3af' },
];

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Populates default categories/flags/relationship colours for the signed-in
 * practitioner, but only if they don't have any yet — same idempotent,
 * per-table "insert defaults only if empty" behaviour as before, just counted
 * against Supabase instead of Dexie. Must run after a session exists (RLS
 * requires auth.uid() on every insert), so this is called once per login from
 * AuthContext rather than unconditionally at app boot.
 */
export async function seedDefaultsIfEmpty() {
  const ownerId = await requireUserId();
  const now = new Date().toISOString();

  const categoryCount = await countRows('categories');
  if (categoryCount === 0) {
    const categories = DEFAULT_CATEGORIES.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      sortOrder: i,
      isDefault: true,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    }));
    unwrap(await supabase.from('categories').insert(categories.map((c) => categoryToRow(c, ownerId))));
  }

  const flagCount = await countRows('flags');
  if (flagCount === 0) {
    const flags = DEFAULT_FLAGS.map((flag, i) => ({
      id: crypto.randomUUID(),
      name: flag.name,
      colour: flag.colour,
      sortOrder: i,
      isDefault: true,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    }));
    unwrap(await supabase.from('flags').insert(flags.map((f) => flagToRow(f, ownerId))));
  }

  const relationshipColourCount = await countRows('relationship_colours');
  if (relationshipColourCount === 0) {
    const relationshipColours = DEFAULT_RELATIONSHIP_COLOURS.map((rc) => ({ ...rc, updatedAt: now }));
    unwrap(
      await supabase
        .from('relationship_colours')
        .insert(relationshipColours.map((rc) => relationshipColourToRow(rc, ownerId))),
    );
  }
}
