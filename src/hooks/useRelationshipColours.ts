import { useRealtimeQuery } from '../lib/useRealtimeQuery';
import { listRelationshipColours } from '../db/repositories/relationshipColours';
import type { RelationshipType } from '../db/types';

/** Returns a type -> colour lookup, falling back to a neutral grey while loading. */
export function useRelationshipColourMap(): Record<RelationshipType, string> {
  const rows = useRealtimeQuery(listRelationshipColours, [], [], { table: 'relationship_colours' });
  const fallback: Record<RelationshipType, string> = {
    strong: '#9ca3af',
    weak: '#9ca3af',
    stressful: '#9ca3af',
    absent: '#9ca3af',
  };
  for (const row of rows) {
    fallback[row.relationshipType] = row.colour;
  }
  return fallback;
}
