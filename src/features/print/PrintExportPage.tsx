import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClient } from '../../hooks/useClients';
import { useEcomapVersion } from '../../hooks/useEcomapVersions';
import { useNodesForVersion } from '../../hooks/useNodesForVersion';
import { useEdgesForVersion } from '../../hooks/useEdgesForVersion';
import { useCategories } from '../../hooks/useCategories';
import { useFlags } from '../../hooks/useFlags';
import { useRelationshipColourMap } from '../../hooks/useRelationshipColours';
import { EcomapCanvas } from '../ecomap-editor/canvas/EcomapCanvas';
import { Button } from '../../components/ui/Button';
import './print.css';

const RELATIONSHIP_LEGEND: { type: 'strong' | 'weak' | 'stressful' | 'absent'; label: string }[] = [
  { type: 'strong', label: 'Solid, thick — strong / positive' },
  { type: 'weak', label: 'Solid, thin — tenuous / weak' },
  { type: 'stressful', label: 'Dashed — stressful / conflictual' },
  { type: 'absent', label: 'Dotted — absent / non-existent but relevant' },
];

export function PrintExportPage() {
  const { clientId, versionId } = useParams();
  const client = useClient(clientId);
  const version = useEcomapVersion(versionId);
  const nodes = useNodesForVersion(versionId);
  const edges = useEdgesForVersion(versionId);
  const categories = useCategories();
  const flags = useFlags();
  const relationshipColours = useRelationshipColourMap();
  const [showNotes, setShowNotes] = useState(true);

  if (!client || !version) {
    return <div className="page">Loading…</div>;
  }

  const usedCategoryIds = new Set((nodes ?? []).map((n) => n.categoryId).filter(Boolean) as string[]);
  const usedFlagIds = new Set((nodes ?? []).map((n) => n.flagId).filter(Boolean) as string[]);
  const legendCategories = (categories ?? []).filter((c) => usedCategoryIds.has(c.id));
  const legendFlags = (flags ?? []).filter((f) => usedFlagIds.has(f.id));

  return (
    <div className="print-page">
      <div className="print-controls no-print">
        <label className="print-notes-toggle">
          <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} />
          Show practitioner notes
        </label>
        <Button variant="primary" onClick={() => window.print()}>Print / Save as PDF</Button>
      </div>

      <header className="print-header">
        <div>
          <h1>Ecomap — {client.caseReference || 'No case reference'}</h1>
          <p className="print-header-meta">{version.versionLabel} · {version.dateOfAssessment}</p>
        </div>
      </header>

      <div className="print-canvas-frame">
        <EcomapCanvas
          nodes={nodes ?? []}
          edges={edges ?? []}
          categories={categories ?? []}
          flags={flags ?? []}
          isReadOnly
        />
      </div>

      <div className="print-legend">
        {legendCategories.length > 0 && (
          <div className="print-legend-group">
            <h2>Categories</h2>
            <ul>
              {legendCategories.map((c) => <li key={c.id}>{c.name}</li>)}
            </ul>
          </div>
        )}
        {legendFlags.length > 0 && (
          <div className="print-legend-group">
            <h2>Colour flags</h2>
            <ul>
              {legendFlags.map((f) => (
                <li key={f.id}>
                  <span className="print-legend-swatch" style={{ background: f.colour }} />
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="print-legend-group">
          <h2>Relationship lines</h2>
          <ul>
            {RELATIONSHIP_LEGEND.map(({ type, label }) => (
              <li key={type}>
                <span className="print-legend-swatch" style={{ background: relationshipColours[type] }} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showNotes && version.summaryNotes && (
        <div className="print-notes">
          <h2>Practitioner summary</h2>
          <p>{version.summaryNotes}</p>
        </div>
      )}
    </div>
  );
}
