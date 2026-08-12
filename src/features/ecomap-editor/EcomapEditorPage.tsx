import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEcomapVersion } from '../../hooks/useEcomapVersions';
import { useNodesForVersion } from '../../hooks/useNodesForVersion';
import { useEdgesForVersion } from '../../hooks/useEdgesForVersion';
import { useCategories } from '../../hooks/useCategories';
import { useFlags } from '../../hooks/useFlags';
import { finaliseVersion } from '../../db/repositories/ecomapVersions';
import { updateNodePosition } from '../../db/repositories/nodes';
import { computeRadialLayout } from './layout/radialLayout';
import { Button } from '../../components/ui/Button';
import { EcomapCanvas, type Selection } from './canvas/EcomapCanvas';
import { NodeInlineEditor } from './canvas/NodeInlineEditor';
import { EdgeInlineSelector } from './canvas/EdgeInlineSelector';
import { QuickAddBar } from './toolbar/QuickAddBar';
import { EditorToolbar } from './toolbar/EditorToolbar';
import { DeskModeSidePanel } from './panels/DeskModeSidePanel';
import './canvas/node-editor.css';
import './editor.css';

export type EditorMode = 'live' | 'desk';

export function EcomapEditorPage() {
  const { clientId, versionId } = useParams();
  const version = useEcomapVersion(versionId);
  const nodes = useNodesForVersion(versionId);
  const edges = useEdgesForVersion(versionId);
  const categories = useCategories();
  const flags = useFlags();
  const [selected, setSelected] = useState<Selection | null>(null);
  const [mode, setMode] = useState<EditorMode>('live');

  if (!version) {
    return <div className="page">Loading…</div>;
  }

  const isFinalised = version.status === 'finalised';
  const selectedNode = selected?.type === 'node' ? nodes?.find((n) => n.id === selected.id) ?? null : null;
  const selectedEdge = selected?.type === 'edge' ? edges?.find((e) => e.id === selected.id) ?? null : null;
  const nonCentralNodeCount = nodes?.filter((n) => !n.isCentral).length ?? 0;

  async function handleResetLayout() {
    if (!nodes) return;
    const layout = computeRadialLayout(nodes, categories ?? []);
    await Promise.all(Object.entries(layout).map(([id, pos]) => updateNodePosition(id, pos.x, pos.y)));
  }

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <h1>{version.versionLabel}</h1>
        <div className="editor-topbar-actions">
          <Link to={`/clients/${clientId}/ecomaps/${version.id}/print`}>
            <Button>Print / Export</Button>
          </Link>
          {!isFinalised && (
            <Button variant="primary" onClick={() => finaliseVersion(version.id)}>
              Finalise version
            </Button>
          )}
        </div>
      </div>

      {isFinalised && (
        <div className="finalised-banner">
          This version is finalised and read-only. Create a new version to make further changes.
        </div>
      )}

      <EditorToolbar
        mode={mode}
        onModeChange={setMode}
        onResetLayout={handleResetLayout}
        canReset={nonCentralNodeCount > 0}
        isReadOnly={isFinalised}
      />

      {mode === 'live' && (
        <>
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
        </>
      )}

      <div className="editor-canvas-row">
        <div className="editor-canvas-wrapper">
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
        {mode === 'desk' && <DeskModeSidePanel version={version} isReadOnly={isFinalised} />}
      </div>
    </div>
  );
}
