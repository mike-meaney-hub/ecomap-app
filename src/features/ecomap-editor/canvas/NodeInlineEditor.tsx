import { useState } from 'react';
import type { EcomapNode, Category, ColourFlag } from '../../../db/types';
import { updateNode, archiveNode } from '../../../db/repositories/nodes';
import { useAutosave } from '../../../autosave/useAutosave';
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
  const [label, setLabel] = useState(node.label);
  const [notes, setNotes] = useState(node.notes);

  const labelAutosave = useAutosave(label, (value) => {
    if (value.trim()) updateNode(node.id, { label: value.trim() });
  }, 500);
  const notesAutosave = useAutosave(notes, (value) => updateNode(node.id, { notes: value }), 800);

  return (
    <div className="node-inline-editor">
      <div className="node-inline-editor-header">
        <span>{node.isCentral ? 'Central node' : 'Edit node'}</span>
        <button type="button" className="node-inline-editor-close" aria-label="Close" onClick={onClose}>×</button>
      </div>

      <Field label="Label">
        <Input
          value={label}
          disabled={isReadOnly}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={labelAutosave.flush}
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
          value={notes}
          disabled={isReadOnly}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={notesAutosave.flush}
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
