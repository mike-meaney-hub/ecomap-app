import { CategoryListEditor } from './CategoryListEditor';
import { FlagPaletteEditor } from './FlagPaletteEditor';
import './settings.css';

export function SettingsPage() {
  return (
    <div className="page">
      <h1>Settings</h1>
      <p className="muted">
        Manage the category list and colour flag palette used across quick-add, the node editor, and the printed legend.
      </p>
      <div className="settings-grid">
        <CategoryListEditor />
        <FlagPaletteEditor />
      </div>
    </div>
  );
}
