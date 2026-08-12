import { useParams } from 'react-router-dom';
import { useEcomapVersion } from '../../hooks/useEcomapVersions';
import { finaliseVersion } from '../../db/repositories/ecomapVersions';
import { Button } from '../../components/ui/Button';
import './editor.css';

export function EcomapEditorPage() {
  const { versionId } = useParams();
  const version = useEcomapVersion(versionId);

  if (!version) {
    return <div className="page">Loading…</div>;
  }

  const isFinalised = version.status === 'finalised';

  return (
    <div className="page">
      <div className="page-header">
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

      <p className="muted">Canvas editor arrives in the next build step.</p>
    </div>
  );
}
