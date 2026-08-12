import { useState } from 'react';
import type { EcomapVersion } from '../../../db/types';
import { updateVersionSummary } from '../../../db/repositories/ecomapVersions';
import { useAutosave } from '../../../autosave/useAutosave';
import './panels.css';

export function DeskModeSidePanel({ version, isReadOnly }: { version: EcomapVersion; isReadOnly: boolean }) {
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
        <h3>Filters &amp; comparison</h3>
        <p>Filters, comparison, and stats — coming in Phase 2.</p>
      </div>
    </aside>
  );
}
