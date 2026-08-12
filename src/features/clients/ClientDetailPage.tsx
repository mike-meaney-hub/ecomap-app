import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../../hooks/useClients';
import { archiveClient, updateClient } from '../../db/repositories/clients';
import { useVersionsForClient } from '../../hooks/useEcomapVersions';
import { createVersion } from '../../db/repositories/ecomapVersions';
import { createCentralNode } from '../../db/repositories/nodes';
import { ClientForm } from './ClientForm';
import { Button } from '../../components/ui/Button';
import './clients.css';

export function ClientDetailPage() {
  const { clientId } = useParams();
  const client = useClient(clientId);
  const versions = useVersionsForClient(clientId);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  if (!client) {
    return <div className="page">Loading…</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{client.displayName}</h1>
        {!editing && (
          <div className="client-detail-actions">
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button
              variant="danger"
              onClick={async () => {
                await archiveClient(client.id);
                navigate('/');
              }}
            >
              Archive client
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <ClientForm
          initial={client}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateClient(client.id, values);
            setEditing(false);
          }}
        />
      ) : (
        <dl className="client-detail-fields">
          <dt>Date of birth / age band</dt>
          <dd>{client.dobOrAgeBand || '—'}</dd>
          <dt>Case / reference number</dt>
          <dd>{client.caseReference || '—'}</dd>
          <dt>Assigned practitioner</dt>
          <dd>{client.assignedPractitioner || '—'}</dd>
        </dl>
      )}

      <section className="ecomap-versions-section">
        <div className="page-header">
          <h2>Ecomap versions</h2>
          <Button
            variant="primary"
            onClick={async () => {
              const label = `Assessment — ${new Date().toLocaleDateString('en-GB')}`;
              const version = await createVersion(client.id, label);
              await createCentralNode(version.id, client.displayName);
              navigate(`/clients/${client.id}/ecomaps/${version.id}`);
            }}
          >
            + New version
          </Button>
        </div>
        {versions?.length === 0 && <p className="muted">No ecomap versions yet.</p>}
        <ul className="version-list">
          {versions?.map((version) => (
            <li key={version.id}>
              <Link to={`/clients/${client.id}/ecomaps/${version.id}`} className="version-list-item">
                <span>{version.versionLabel}</span>
                <span className={`version-status version-status-${version.status}`}>{version.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
