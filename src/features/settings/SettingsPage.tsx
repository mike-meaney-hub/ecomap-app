import { CategoryListEditor } from './CategoryListEditor';
import { FlagPaletteEditor } from './FlagPaletteEditor';
import { RelationshipColourEditor } from './RelationshipColourEditor';
import { Button } from '../../components/ui/Button';
import { exportDatabaseBackup } from '../../db/exportBackup';
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

      <div className="settings-data-section">
        <h2>Data</h2>
        <p className="muted">
          Export every client, ecomap version, node, edge, and lookup table as a single JSON file — for backup, or to
          keep your data independent of this tool.
        </p>
        <Button onClick={() => exportDatabaseBackup()}>Export all data (JSON)</Button>
      </div>
    </div>
  );
}
