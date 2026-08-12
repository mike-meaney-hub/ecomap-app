import { db } from '../schema';
import type { RelationshipType } from '../types';

export async function listRelationshipColours() {
  return db.relationshipColours.toArray();
}

export async function updateRelationshipColour(relationshipType: RelationshipType, colour: string) {
  await db.relationshipColours.put({ relationshipType, colour, updatedAt: new Date().toISOString() });
}
