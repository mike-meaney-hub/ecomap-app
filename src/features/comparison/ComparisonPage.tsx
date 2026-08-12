import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useVersionsForClient } from '../../hooks/useEcomapVersions';
import { useNodesForVersion } from '../../hooks/useNodesForVersion';
import { useEdgesForVersion } from '../../hooks/useEdgesForVersion';
import { useCategories } from '../../hooks/useCategories';
import { useFlags } from '../../hooks/useFlags';
import { EcomapCanvas } from '../ecomap-editor/canvas/EcomapCanvas';
import type { HighlightKind } from '../ecomap-editor/canvas/highlight';
import { computeEcomapDiff } from './diffLogic';
import { ChangeList } from './ChangeList';
import './comparison.css';

export function ComparisonPage() {
  const { clientId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const versions = useVersionsForClient(clientId);

  const paramA = searchParams.get('a');
  const paramB = searchParams.get('b');
  const validIds = new Set((versions ?? []).map((v) => v.id));
  const versionAId = paramA && validIds.has(paramA) ? paramA : versions?.[0]?.id;
  const versionBId = paramB && validIds.has(paramB) ? paramB : versions?.[1]?.id;

  useEffect(() => {
    if (!versions || versions.length < 2) return;
    if (versionAId && versionBId && (paramA !== versionAId || paramB !== versionBId)) {
      setSearchParams({ a: versionAId, b: versionBId }, { replace: true });
    }
  }, [versions, versionAId, versionBId, paramA, paramB, setSearchParams]);

  const nodesA = useNodesForVersion(versionAId);
  const edgesA = useEdgesForVersion(versionAId);
  const nodesB = useNodesForVersion(versionBId);
  const edgesB = useEdgesForVersion(versionBId);
  const categories = useCategories();
  const flags = useFlags();

  if (!versions) {
    return <div className="page">Loading…</div>;
  }

  if (versions.length < 2) {
    return (
      <div className="page">
        <h1>Compare versions</h1>
        <p className="muted">You need at least two ecomap versions for this client to compare.</p>
        {clientId && <Link to={`/clients/${clientId}`}>Back to client</Link>}
      </div>
    );
  }

  const diff =
    nodesA && edgesA && nodesB && edgesB ? computeEcomapDiff(nodesA, edgesA, nodesB, edgesB) : null;

  const highlightA = new Map<string, HighlightKind>();
  const highlightB = new Map<string, HighlightKind>();
  if (diff) {
    for (const entry of diff.nodes) {
      if (entry.status === 'removed' && entry.nodeA) highlightA.set(entry.nodeA.id, 'removed');
      if (entry.status === 'added' && entry.nodeB) highlightB.set(entry.nodeB.id, 'added');
      if (entry.status === 'changed') {
        if (entry.nodeA) highlightA.set(entry.nodeA.id, 'changed');
        if (entry.nodeB) highlightB.set(entry.nodeB.id, 'changed');
      }
    }
    for (const entry of diff.edges) {
      if (entry.status === 'removed' && entry.edgeA) highlightA.set(entry.edgeA.id, 'removed');
      if (entry.status === 'added' && entry.edgeB) highlightB.set(entry.edgeB.id, 'added');
      if (entry.status === 'changed') {
        if (entry.edgeA) highlightA.set(entry.edgeA.id, 'changed');
        if (entry.edgeB) highlightB.set(entry.edgeB.id, 'changed');
      }
    }
  }

  const versionA = versions.find((v) => v.id === versionAId);
  const versionB = versions.find((v) => v.id === versionBId);

  return (
    <div className="page comparison-page">
      <h1>Compare versions</h1>

      <div className="comparison-selectors">
        <label>
          Version A
          <select
            className="ui-input"
            value={versionAId}
            onChange={(e) => setSearchParams({ a: e.target.value, b: versionBId ?? '' })}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>{v.versionLabel} ({v.dateOfAssessment})</option>
            ))}
          </select>
        </label>
        <label>
          Version B
          <select
            className="ui-input"
            value={versionBId}
            onChange={(e) => setSearchParams({ a: versionAId ?? '', b: e.target.value })}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>{v.versionLabel} ({v.dateOfAssessment})</option>
            ))}
          </select>
        </label>
      </div>

      {versionAId === versionBId && <p className="muted">Pick two different versions to compare.</p>}

      <div className="comparison-panes">
        <div className="comparison-pane">
          <h3>{versionA?.versionLabel}</h3>
          <div className="comparison-canvas-frame">
            <EcomapCanvas
              nodes={nodesA ?? []}
              edges={edgesA ?? []}
              categories={categories ?? []}
              flags={flags ?? []}
              isReadOnly
              highlight={highlightA}
            />
          </div>
        </div>
        <div className="comparison-pane">
          <h3>{versionB?.versionLabel}</h3>
          <div className="comparison-canvas-frame">
            <EcomapCanvas
              nodes={nodesB ?? []}
              edges={edgesB ?? []}
              categories={categories ?? []}
              flags={flags ?? []}
              isReadOnly
              highlight={highlightB}
            />
          </div>
        </div>
      </div>

      <div className="comparison-legend">
        <span><span className="comparison-legend-swatch comparison-legend-added" /> Added</span>
        <span><span className="comparison-legend-swatch comparison-legend-removed" /> Removed</span>
        <span><span className="comparison-legend-swatch comparison-legend-changed" /> Changed</span>
      </div>

      {diff && <ChangeList diff={diff} categories={categories ?? []} nodesA={nodesA ?? []} nodesB={nodesB ?? []} />}
    </div>
  );
}
