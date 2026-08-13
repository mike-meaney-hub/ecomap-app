import { supabase, requireUserId, unwrap } from '../../lib/supabaseClient';
import { relationshipColourFromRow, relationshipColourToRow, type RelationshipColourRow } from '../supabaseMappers';
import type { RelationshipType } from '../types';

export async function listRelationshipColours() {
  const rows = unwrap(await supabase.from('relationship_colours').select('*')) as RelationshipColourRow[];
  return rows.map(relationshipColourFromRow);
}

export async function updateRelationshipColour(relationshipType: RelationshipType, colour: string) {
  const ownerId = await requireUserId();
  unwrap(
    await supabase
      .from('relationship_colours')
      .upsert(relationshipColourToRow({ relationshipType, colour, updatedAt: new Date().toISOString() }, ownerId)),
  );
}
