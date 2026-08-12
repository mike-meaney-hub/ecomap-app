import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEcomapVersion } from '../../hooks/useEcomapVersions';
import { useNodesForVersion } from '../../hooks/useNodesForVersion';
import { useCategories } from '../../hooks/useCategories';
import { useFlags } from '../../hooks/useFlags';
import { finaliseVersion } from '../../db/repositories/ecomapVersions';
import { Button } from '../../components/ui/Button';
import { EcomapCanvas } from './canvas/EcomapCanvas';
import { NodeInlineEditor } from './canvas/NodeInlineEditor';
import { QuickAddBar } from './toolbar/QuickAddBar';
import './canvas/node-editor.css';
import './editor.css';

export function EcomapEditorPage() {
  const { versionId } = useParams();
  const version = useEcomapVersion(versionId);
  const nodes = useNodesForVersion(versionId);
  const categories = useCategories();
  const flags = useFlags();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!version) {
    return <div className="page">Loading…</div>;
  }

  const isFinalised = version.status === 'finalised';
  const selectedNode = nodes?.find((n) => n.id === selectedNodeId) ?? null;

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
        onNodeAdded={setSelectedNodeId}
      />

      <div className="editor-canvas-area">
        <EcomapCanvas
          nodes={nodes ?? []}
          categories={categories ?? []}
          flags={flags ?? []}
          isReadOnly={isFinalised}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
        {selectedNode && (
          <NodeInlineEditor
            node={selectedNode}
            categories={categories ?? []}
            flags={flags ?? []}
            isReadOnly={isFinalised}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
