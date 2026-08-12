import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../../hooks/useClients';
import { archiveClient, updateClient } from '../../db/repositories/clients';
import { ClientForm } from './ClientForm';
import { Button } from '../../components/ui/Button';
import './clients.css';

export function ClientDetailPage() {
  const { clientId } = useParams();
  const client = useClient(clientId);
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
        <h2>Ecomap versions</h2>
        <p className="muted">Versioning arrives in the next build step.</p>
      </section>
    </div>
  );
}
