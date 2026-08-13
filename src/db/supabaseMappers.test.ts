import { describe, expect, it } from 'vitest';
import type { Client, EcomapVersion, EcomapNode, EcomapEdge, Category, ColourFlag, RelationshipColour } from './types';
import {
  clientFromRow,
  clientToRow,
  versionFromRow,
  versionToRow,
  nodeFromRow,
  nodeToRow,
  edgeFromRow,
  edgeToRow,
  categoryFromRow,
  categoryToRow,
  flagFromRow,
  flagToRow,
  relationshipColourFromRow,
  relationshipColourToRow,
} from './supabaseMappers';

const OWNER_ID = 'owner-1';
const NOW = '2026-08-13T00:00:00.000Z';

describe('supabaseMappers round-trips', () => {
  it('clients survive toRow/fromRow', () => {
    const client: Client = {
      id: 'c1',
      displayName: 'A Client',
      dobOrAgeBand: '30-39',
      caseReference: 'REF-1',
      assignedPractitioner: 'Practitioner',
      status: 'active',
      createdAt: NOW,
      updatedAt: NOW,
    };
    expect(clientFromRow(clientToRow(client, OWNER_ID))).toEqual(client);
  });

  it('ecomap versions survive toRow/fromRow', () => {
    const version: EcomapVersion = {
      id: 'v1',
      clientId: 'c1',
      dateOfAssessment: '2026-08-13',
      versionLabel: 'Initial',
      summaryNotes: 'notes',
      status: 'draft',
      createdAt: NOW,
      updatedAt: NOW,
    };
    expect(versionFromRow(versionToRow(version, OWNER_ID))).toEqual(version);
  });

  it('nodes survive toRow/fromRow, including nullable FKs', () => {
    const node: EcomapNode = {
      id: 'n1',
      ecomapVersionId: 'v1',
      label: 'Node',
      categoryId: null,
      flagId: null,
      x: 12.5,
      y: -4,
      notes: '',
      isCentral: true,
      isHouseholdMember: true,
      status: 'active',
      createdAt: NOW,
      updatedAt: NOW,
    };
    expect(nodeFromRow(nodeToRow(node, OWNER_ID))).toEqual(node);
  });

  it('edges survive toRow/fromRow', () => {
    const edge: EcomapEdge = {
      id: 'e1',
      ecomapVersionId: 'v1',
      fromNodeId: 'n1',
      toNodeId: 'n2',
      relationshipType: 'stressful',
      direction: 'bidirectional',
      label: 'label',
      status: 'active',
      createdAt: NOW,
      updatedAt: NOW,
    };
    expect(edgeFromRow(edgeToRow(edge, OWNER_ID))).toEqual(edge);
  });

  it('categories survive toRow/fromRow', () => {
    const category: Category = {
      id: 'cat1',
      name: 'Family',
      sortOrder: 0,
      isDefault: true,
      status: 'active',
      createdAt: NOW,
      updatedAt: NOW,
    };
    expect(categoryFromRow(categoryToRow(category, OWNER_ID))).toEqual(category);
  });

  it('flags survive toRow/fromRow', () => {
    const flag: ColourFlag = {
      id: 'f1',
      name: 'Immediate family',
      colour: '#f5c518',
      sortOrder: 0,
      isDefault: true,
      status: 'active',
      createdAt: NOW,
      updatedAt: NOW,
    };
    expect(flagFromRow(flagToRow(flag, OWNER_ID))).toEqual(flag);
  });

  it('relationship colours survive toRow/fromRow', () => {
    const rc: RelationshipColour = {
      relationshipType: 'strong',
      colour: '#16a34a',
      updatedAt: NOW,
    };
    expect(relationshipColourFromRow(relationshipColourToRow(rc, OWNER_ID))).toEqual(rc);
  });
});
