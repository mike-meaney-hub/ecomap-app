import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEcomapVersion } from '../../hooks/useEcomapVersions';
import { useNodesForVersion } from '../../hooks/useNodesForVersion';
import { useEdgesForVersion } from '../../hooks/useEdgesForVersion';
import { useCategories } from '../../hooks/useCategories';
import { useFlags } from '../../hooks/useFlags';
import { finaliseVersion, updateVersionSummary } from '../../db/repositories/ecomapVersions';
import { useAutosave } from '../../autosave/useAutosave';
import { Button } from '../../components/ui/Button';
import { EcomapCanvas, type Selection } from './canvas/EcomapCanvas';
import { NodeInlineEditor } from './canvas/NodeInlineEditor';
import { EdgeInlineSelector } from './canvas/EdgeInlineSelector';
import { QuickAddBar } from './toolbar/QuickAddBar';
import './canvas/node-editor.css';
import './editor.css';

function VersionSummaryNotes({ versionId, summaryNotes }: { versionId: string; summaryNotes: string }) {
  const [notes, setNotes] = useState(summaryNotes);
  const autosave = useAutosave(notes, (value) => updateVersionSummary(versionId, value), 800);

  return (
    <textarea
      key={versionId}
      className="ui-input version-summary-notes"
      placeholder="Practitioner summary for this version…"
      rows={2}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={autosave.flush}
    />
  );
}

export function EcomapEditorPage() {
  const { versionId } = useParams();
  const version = useEcomapVersion(versionId);
  const nodes = useNodesForVersion(versionId);
  const edges = useEdgesForVersion(versionId);
  const categories = useCategories();
  const flags = useFlags();
  const [selected, setSelected] = useState<Selection | null>(null);

  if (!version) {
    return <div className="page">Loading…</div>;
  }

  const isFinalised = version.status === 'finalised';
  const selectedNode = selected?.type === 'node' ? nodes?.find((n) => n.id === selected.id) ?? null : null;
  const selectedEdge = selected?.type === 'edge' ? edges?.find((e) => e.id === selected.id) ?? null : null;

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <h1>{version.versionLabel}</h1>
        {!isFinalised && (
          <Button variant="primary" onClick={() => finaliseVersion(version.id)}>
            Finalise version
          </Button>
        )}
      </div>

      {isFinalised ? (
        version.summaryNotes && <p className="version-summary-readonly">{version.summaryNotes}</p>
      ) : (
        <VersionSummaryNotes versionId={version.id} summaryNotes={version.summaryNotes} />
      )}

      {isFinalised && (
        <div className="finalised-banner">
          This version is finalised and read-only. Create a new version to make further changes.
        </div>
      )}

      <QuickAddBar
        versionId={version.id}
        categories={categories ?? []}
        nodes={nodes ?? []}
        isReadOnly={isFinalised}
        onNodeAdded={(id) => setSelected({ type: 'node', id })}
      />

      {!isFinalised && (
        <p className="editor-hint no-print">Shift+drag from a node to another node to draw a relationship.</p>
      )}

      <div className="editor-canvas-area">
        <EcomapCanvas
          nodes={nodes ?? []}
          edges={edges ?? []}
          categories={categories ?? []}
          flags={flags ?? []}
          isReadOnly={isFinalised}
          selected={selected}
          onSelect={setSelected}
        />
        {selectedNode && (
          <NodeInlineEditor
            key={selectedNode.id}
            node={selectedNode}
            categories={categories ?? []}
            flags={flags ?? []}
            isReadOnly={isFinalised}
            onClose={() => setSelected(null)}
          />
        )}
        {selectedEdge && (
          <EdgeInlineSelector
            key={selectedEdge.id}
            edge={selectedEdge}
            isReadOnly={isFinalised}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
