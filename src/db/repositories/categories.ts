import { db } from '../schema';

export async function listActiveCategories() {
  return db.categories.where('status').notEqual('archived').sortBy('sortOrder');
}

export async function createCategory(name: string) {
  const now = new Date().toISOString();
  const maxSortOrder = (await db.categories.orderBy('sortOrder').last())?.sortOrder ?? -1;
  const category = {
    id: crypto.randomUUID(),
    name,
    sortOrder: maxSortOrder + 1,
    isDefault: false,
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };
  await db.categories.add(category);
  return category;
}

export async function renameCategory(id: string, name: string) {
  await db.categories.update(id, { name, updatedAt: new Date().toISOString() });
}

export async function reorderCategory(id: string, sortOrder: number) {
  await db.categories.update(id, { sortOrder, updatedAt: new Date().toISOString() });
}

export async function archiveCategory(id: string) {
  await db.categories.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
}
