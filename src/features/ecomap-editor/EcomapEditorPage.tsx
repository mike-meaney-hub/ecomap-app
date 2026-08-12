import { useParams } from 'react-router-dom';

export function EcomapEditorPage() {
  const { clientId, versionId } = useParams();
  return (
    <div className="page">
      <h1>Ecomap editor — client {clientId}, version {versionId}</h1>
    </div>
  );
}
