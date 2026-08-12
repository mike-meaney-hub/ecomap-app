import type { EcomapNode, Category, ColourFlag } from '../../../db/types';
import { updateNode, archiveNode } from '../../../db/repositories/nodes';
import { SwatchPicker } from './SwatchPicker';
import { Button } from '../../../components/ui/Button';
import { Field, Input } from '../../../components/ui/Input';

export function NodeInlineEditor({
  node,
  categories,
  flags,
  isReadOnly,
  onClose,
}: {
  node: EcomapNode;
  categories: Category[];
  flags: ColourFlag[];
  isReadOnly: boolean;
  onClose: () => void;
}) {
  return (
    <div className="node-inline-editor">
      <div className="node-inline-editor-header">
        <span>{node.isCentral ? 'Central node' : 'Edit node'}</span>
        <button type="button" className="node-inline-editor-close" aria-label="Close" onClick={onClose}>×</button>
      </div>

      <Field label="Label">
        <Input
          defaultValue={node.label}
          disabled={isReadOnly}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value !== node.label) {
              updateNode(node.id, { label: e.target.value.trim() });
            }
          }}
        />
      </Field>

      {!node.isCentral && (
        <Field label="Category">
          <select
            className="ui-input"
            defaultValue={node.categoryId ?? ''}
            disabled={isReadOnly}
            onChange={(e) => updateNode(node.id, { categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      )}

      {!node.isCentral && (
        <Field label="Colour flag">
          <SwatchPicker
            flags={flags}
            selectedFlagId={node.flagId}
            isReadOnly={isReadOnly}
            onSelect={(flagId) => updateNode(node.id, { flagId })}
          />
        </Field>
      )}

      <Field label="Notes">
        <textarea
          className="ui-input node-inline-editor-notes"
          rows={3}
          defaultValue={node.notes}
          disabled={isReadOnly}
          onBlur={(e) => {
            if (e.target.value !== node.notes) updateNode(node.id, { notes: e.target.value });
          }}
        />
      </Field>

      {!node.isCentral && !isReadOnly && (
        <Button
          variant="danger"
          onClick={() => {
            archiveNode(node.id);
            onClose();
          }}
        >
          Archive node
        </Button>
      )}
    </div>
  );
}
