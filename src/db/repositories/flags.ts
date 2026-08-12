import { db } from '../schema';

export async function listActiveFlags() {
  return db.flags.where('status').notEqual('archived').sortBy('sortOrder');
}

export async function createFlag(name: string, colour: string) {
  const now = new Date().toISOString();
  const maxSortOrder = (await db.flags.orderBy('sortOrder').last())?.sortOrder ?? -1;
  const flag = {
    id: crypto.randomUUID(),
    name,
    colour,
    sortOrder: maxSortOrder + 1,
    isDefault: false,
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };
  await db.flags.add(flag);
  return flag;
}

export async function renameFlag(id: string, name: string, colour: string) {
  await db.flags.update(id, { name, colour, updatedAt: new Date().toISOString() });
}

export async function reorderFlag(id: string, sortOrder: number) {
  await db.flags.update(id, { sortOrder, updatedAt: new Date().toISOString() });
}

export async function archiveFlag(id: string) {
  await db.flags.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
}
