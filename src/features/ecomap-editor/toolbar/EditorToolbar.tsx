import { Button } from '../../../components/ui/Button';
import type { EditorMode } from '../EcomapEditorPage';

export function EditorToolbar({
  mode,
  onModeChange,
  onResetLayout,
  canReset,
  isReadOnly,
}: {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onResetLayout: () => void;
  canReset: boolean;
  isReadOnly: boolean;
}) {
  return (
    <div className="editor-toolbar no-print">
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'live' ? 'mode-toggle-btn-active' : ''}`}
          onClick={() => onModeChange('live')}
        >
          Live session
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'desk' ? 'mode-toggle-btn-active' : ''}`}
          onClick={() => onModeChange('desk')}
        >
          Desk review
        </button>
      </div>
      {!isReadOnly && (
        <Button
          disabled={!canReset}
          onClick={() => {
            if (window.confirm('Reset layout? This repositions every node back into its category arc and discards manual placement.')) {
              onResetLayout();
            }
          }}
        >
          Reset layout
        </Button>
      )}
    </div>
  );
}
