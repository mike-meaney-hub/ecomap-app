import { CategoryListEditor } from './CategoryListEditor';
import { FlagPaletteEditor } from './FlagPaletteEditor';
import { RelationshipColourEditor } from './RelationshipColourEditor';
import './settings.css';

export function SettingsPage() {
  return (
    <div className="page">
      <h1>Settings</h1>
      <p className="muted">
        Manage the category list, colour flag palette, and relationship line colours used across quick-add, the node
        editor, and the printed legend.
      </p>
      <div className="settings-grid">
        <CategoryListEditor />
        <FlagPaletteEditor />
        <RelationshipColourEditor />
      </div>
    </div>
  );
}
