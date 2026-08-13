import type {
  Client,
  EcomapVersion,
  EcomapNode,
  EcomapEdge,
  Category,
  ColourFlag,
  RelationshipColour,
} from './types';

// Postgres row shapes (snake_case) <-> domain types (camelCase, used throughout
// src/features/**). Keeping the mapping centralised here is what lets the
// repository functions in src/db/repositories/*.ts keep their existing
// exported signatures while swapping Dexie for Supabase underneath.

export interface ClientRow {
  id: string;
  owner_id: string;
  display_name: string;
  dob_or_age_band: string;
  case_reference: string;
  assigned_practitioner: string;
  status: Client['status'];
  created_at: string;
  updated_at: string;
}

export function clientFromRow(row: ClientRow): Client {
  return {
    id: row.id,
    displayName: row.display_name,
    dobOrAgeBand: row.dob_or_age_band,
    caseReference: row.case_reference,
    assignedPractitioner: row.assigned_practitioner,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function clientToRow(client: Client, ownerId: string): ClientRow {
  return {
    id: client.id,
    owner_id: ownerId,
    display_name: client.displayName,
    dob_or_age_band: client.dobOrAgeBand,
    case_reference: client.caseReference,
    assigned_practitioner: client.assignedPractitioner,
    status: client.status,
    created_at: client.createdAt,
    updated_at: client.updatedAt,
  };
}

export interface EcomapVersionRow {
  id: string;
  owner_id: string;
  client_id: string;
  date_of_assessment: string | null;
  version_label: string;
  summary_notes: string;
  status: EcomapVersion['status'];
  created_at: string;
  updated_at: string;
}

export function versionFromRow(row: EcomapVersionRow): EcomapVersion {
  return {
    id: row.id,
    clientId: row.client_id,
    dateOfAssessment: row.date_of_assessment ?? '',
    versionLabel: row.version_label,
    summaryNotes: row.summary_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function versionToRow(version: EcomapVersion, ownerId: string): EcomapVersionRow {
  return {
    id: version.id,
    owner_id: ownerId,
    client_id: version.clientId,
    date_of_assessment: version.dateOfAssessment || null,
    version_label: version.versionLabel,
    summary_notes: version.summaryNotes,
    status: version.status,
    created_at: version.createdAt,
    updated_at: version.updatedAt,
  };
}

export interface NodeRow {
  id: string;
  owner_id: string;
  ecomap_version_id: string;
  label: string;
  category_id: string | null;
  flag_id: string | null;
  x: number;
  y: number;
  notes: string;
  is_central: boolean;
  is_household_member: boolean;
  status: EcomapNode['status'];
  created_at: string;
  updated_at: string;
}

export function nodeFromRow(row: NodeRow): EcomapNode {
  return {
    id: row.id,
    ecomapVersionId: row.ecomap_version_id,
    label: row.label,
    categoryId: row.category_id,
    flagId: row.flag_id,
    x: row.x,
    y: row.y,
    notes: row.notes,
    isCentral: row.is_central,
    isHouseholdMember: row.is_household_member,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function nodeToRow(node: EcomapNode, ownerId: string): NodeRow {
  return {
    id: node.id,
    owner_id: ownerId,
    ecomap_version_id: node.ecomapVersionId,
    label: node.label,
    category_id: node.categoryId,
    flag_id: node.flagId,
    x: node.x,
    y: node.y,
    notes: node.notes,
    is_central: node.isCentral,
    is_household_member: node.isHouseholdMember,
    status: node.status,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  };
}

export interface EdgeRow {
  id: string;
  owner_id: string;
  ecomap_version_id: string;
  from_node_id: string;
  to_node_id: string;
  relationship_type: EcomapEdge['relationshipType'];
  direction: EcomapEdge['direction'];
  label: string;
  status: EcomapEdge['status'];
  created_at: string;
  updated_at: string;
}

export function edgeFromRow(row: EdgeRow): EcomapEdge {
  return {
    id: row.id,
    ecomapVersionId: row.ecomap_version_id,
    fromNodeId: row.from_node_id,
    toNodeId: row.to_node_id,
    relationshipType: row.relationship_type,
    direction: row.direction,
    label: row.label,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function edgeToRow(edge: EcomapEdge, ownerId: string): EdgeRow {
  return {
    id: edge.id,
    owner_id: ownerId,
    ecomap_version_id: edge.ecomapVersionId,
    from_node_id: edge.fromNodeId,
    to_node_id: edge.toNodeId,
    relationship_type: edge.relationshipType,
    direction: edge.direction,
    label: edge.label,
    status: edge.status,
    created_at: edge.createdAt,
    updated_at: edge.updatedAt,
  };
}

export interface CategoryRow {
  id: string;
  owner_id: string;
  name: string;
  sort_order: number;
  is_default: boolean;
  status: Category['status'];
  created_at: string;
  updated_at: string;
}

export function categoryFromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function categoryToRow(category: Category, ownerId: string): CategoryRow {
  return {
    id: category.id,
    owner_id: ownerId,
    name: category.name,
    sort_order: category.sortOrder,
    is_default: category.isDefault,
    status: category.status,
    created_at: category.createdAt,
    updated_at: category.updatedAt,
  };
}

export interface FlagRow {
  id: string;
  owner_id: string;
  name: string;
  colour: string;
  sort_order: number;
  is_default: boolean;
  status: ColourFlag['status'];
  created_at: string;
  updated_at: string;
}

export function flagFromRow(row: FlagRow): ColourFlag {
  return {
    id: row.id,
    name: row.name,
    colour: row.colour,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function flagToRow(flag: ColourFlag, ownerId: string): FlagRow {
  return {
    id: flag.id,
    owner_id: ownerId,
    name: flag.name,
    colour: flag.colour,
    sort_order: flag.sortOrder,
    is_default: flag.isDefault,
    status: flag.status,
    created_at: flag.createdAt,
    updated_at: flag.updatedAt,
  };
}

export interface RelationshipColourRow {
  relationship_type: RelationshipColour['relationshipType'];
  owner_id: string;
  colour: string;
  updated_at: string;
}

export function relationshipColourFromRow(row: RelationshipColourRow): RelationshipColour {
  return {
    relationshipType: row.relationship_type,
    colour: row.colour,
    updatedAt: row.updated_at,
  };
}

export function relationshipColourToRow(rc: RelationshipColour, ownerId: string): RelationshipColourRow {
  return {
    relationship_type: rc.relationshipType,
    owner_id: ownerId,
    colour: rc.colour,
    updated_at: rc.updatedAt,
  };
}
