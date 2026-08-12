import Dexie, { type EntityTable } from 'dexie';
import type { Client, EcomapVersion, EcomapNode, EcomapEdge, Category, ColourFlag, RelationshipColour } from './types';

export class EcomapDB extends Dexie {
  clients!: EntityTable<Client, 'id'>;
  ecomapVersions!: EntityTable<EcomapVersion, 'id'>;
  nodes!: EntityTable<EcomapNode, 'id'>;
  edges!: EntityTable<EcomapEdge, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  flags!: EntityTable<ColourFlag, 'id'>;
  relationshipColours!: EntityTable<RelationshipColour, 'relationshipType'>;

  constructor() {
    super('EcomapDB');
    this.version(1).stores({
      clients: 'id, status, caseReference, createdAt',
      ecomapVersions: 'id, clientId, status, [clientId+status], createdAt',
      nodes: 'id, ecomapVersionId, status, [ecomapVersionId+status], categoryId, flagId',
      edges: 'id, ecomapVersionId, status, [ecomapVersionId+status], fromNodeId, toNodeId',
      categories: 'id, status, sortOrder',
      flags: 'id, status, sortOrder',
    });
    this.version(2).stores({
      relationshipColours: 'relationshipType',
    });
  }
}

export const db = new EcomapDB();
