import { useState } from 'react';
import type { EcomapVersion, EcomapNode, EcomapEdge, Category } from '../../../db/types';
import { updateVersionSummary } from '../../../db/repositories/ecomapVersions';
import { useAutosave } from '../../../autosave/useAutosave';
import { StatsPanel } from '../stats/StatsPanel';
import './panels.css';

export function DeskModeSidePanel({
  version,
  isReadOnly,
  nodes,
  edges,
  categories,
}: {
  version: EcomapVersion;
  isReadOnly: boolean;
  nodes: EcomapNode[];
  edges: EcomapEdge[];
  categories: Category[];
}) {
  const [notes, setNotes] = useState(version.summaryNotes);
  const autosave = useAutosave(notes, (value) => updateVersionSummary(version.id, value), 800);

  return (
    <aside className="desk-side-panel no-print">
      <div className="desk-side-panel-section">
        <h3>Version details</h3>
        <dl className="desk-side-panel-meta">
          <dt>Date of assessment</dt>
          <dd>{version.dateOfAssessment}</dd>
          <dt>Status</dt>
          <dd>{version.status}</dd>
        </dl>
      </div>

      <div className="desk-side-panel-section">
        <h3>Practitioner summary</h3>
        <textarea
          key={version.id}
          className="ui-input desk-side-panel-notes"
          rows={5}
          value={notes}
          disabled={isReadOnly}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={autosave.flush}
          placeholder="Summary notes for this version…"
        />
      </div>

      <div className="desk-side-panel-section desk-side-panel-placeholder">
        <h3>Filters</h3>
        <p>Filters arrive in the next build step.</p>
      </div>

      <div className="desk-side-panel-section">
        <h3>Connection summary</h3>
        <StatsPanel nodes={nodes} edges={edges} categories={categories} />
      </div>
    </aside>
  );
}
