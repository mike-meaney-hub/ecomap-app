export type ArchivableStatus = 'active' | 'archived';

export type ClientStatus = 'active' | 'closed' | 'archived';

export interface Client {
  id: string;
  displayName: string;
  dobOrAgeBand: string;
  caseReference: string;
  assignedPractitioner: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export type EcomapVersionStatus = 'draft' | 'finalised' | 'archived';

export interface EcomapVersion {
  id: string;
  clientId: string;
  dateOfAssessment: string;
  versionLabel: string;
  summaryNotes: string;
  status: EcomapVersionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EcomapNode {
  id: string;
  ecomapVersionId: string;
  label: string;
  categoryId: string | null;
  flagId: string | null;
  x: number;
  y: number;
  notes: string;
  isCentral: boolean;
  isHouseholdMember: boolean;
  status: ArchivableStatus;
  createdAt: string;
  updatedAt: string;
}

export type RelationshipType = 'strong' | 'weak' | 'stressful' | 'absent';
export type EdgeDirection = 'none' | 'oneWayAToB' | 'oneWayBToA' | 'bidirectional';

export interface EcomapEdge {
  id: string;
  ecomapVersionId: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipType: RelationshipType;
  direction: EdgeDirection;
  label: string;
  status: ArchivableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isDefault: boolean;
  status: ArchivableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ColourFlag {
  id: string;
  name: string;
  colour: string;
  sortOrder: number;
  isDefault: boolean;
  status: ArchivableStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * One row per RelationshipType (fixed set of 4, not user-addable/retireable —
 * the type itself is structural). relationshipType is the primary key.
 */
export interface RelationshipColour {
  relationshipType: RelationshipType;
  colour: string;
  updatedAt: string;
}
