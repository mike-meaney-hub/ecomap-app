import type { EcomapEdge, RelationshipType, EdgeDirection } from '../../../db/types';
import { updateEdge, archiveEdge } from '../../../db/repositories/edges';
import { Button } from '../../../components/ui/Button';
import { Field, Input } from '../../../components/ui/Input';

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  strong: 'Strong / positive',
  weak: 'Tenuous / weak',
  stressful: 'Stressful / conflictual',
  absent: 'Absent / non-existent',
};

const DIRECTION_LABELS: Record<EdgeDirection, string> = {
  none: 'No direction',
  oneWayAToB: 'One-way →',
  oneWayBToA: 'One-way ←',
  bidirectional: 'Bidirectional ↔',
};

export function EdgeInlineSelector({
  edge,
  isReadOnly,
  onClose,
}: {
  edge: EcomapEdge;
  isReadOnly: boolean;
  onClose: () => void;
}) {
  return (
    <div className="node-inline-editor">
      <div className="node-inline-editor-header">
        <span>Edit relationship</span>
        <button type="button" className="node-inline-editor-close" aria-label="Close" onClick={onClose}>×</button>
      </div>

      <Field label="Relationship type">
        <div className="edge-type-options">
          {(Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]).map((type) => (
            <button
              key={type}
              type="button"
              className={`edge-type-btn ${edge.relationshipType === type ? 'edge-type-btn-selected' : ''}`}
              disabled={isReadOnly}
              onClick={() => updateEdge(edge.id, { relationshipType: type })}
            >
              {RELATIONSHIP_LABELS[type]}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Direction">
        <select
          className="ui-input"
          value={edge.direction}
          disabled={isReadOnly}
          onChange={(e) => updateEdge(edge.id, { direction: e.target.value as EdgeDirection })}
        >
          {(Object.keys(DIRECTION_LABELS) as EdgeDirection[]).map((d) => (
            <option key={d} value={d}>{DIRECTION_LABELS[d]}</option>
          ))}
        </select>
      </Field>

      <Field label="Label / note">
        <Input
          defaultValue={edge.label}
          disabled={isReadOnly}
          placeholder="e.g. weekly contact"
          onBlur={(e) => {
            if (e.target.value !== edge.label) updateEdge(edge.id, { label: e.target.value });
          }}
        />
      </Field>

      {!isReadOnly && (
        <Button
          variant="danger"
          onClick={() => {
            archiveEdge(edge.id);
            onClose();
          }}
        >
          Archive relationship
        </Button>
      )}
    </div>
  );
}
