import { db } from './schema';

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

export async function seedDefaultsIfEmpty() {
  const now = new Date().toISOString();

  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    await db.categories.bulkAdd(
      DEFAULT_CATEGORIES.map((name, i) => ({
        id: crypto.randomUUID(),
        name,
        sortOrder: i,
        isDefault: true,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  const flagCount = await db.flags.count();
  if (flagCount === 0) {
    await db.flags.bulkAdd(
      DEFAULT_FLAGS.map((flag, i) => ({
        id: crypto.randomUUID(),
        name: flag.name,
        colour: flag.colour,
        sortOrder: i,
        isDefault: true,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }
}
