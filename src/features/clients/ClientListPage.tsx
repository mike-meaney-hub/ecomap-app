import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveClients } from '../../hooks/useClients';
import { createClient } from '../../db/repositories/clients';
import { hasTutorialBeenSeen } from '../../lib/tutorialPreference';
import { TutorialModal } from '../tutorial/TutorialModal';
import { ClientForm } from './ClientForm';
import { Button } from '../../components/ui/Button';
import './clients.css';

export function ClientListPage() {
  const clients = useActiveClients();
  const [showForm, setShowForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Clients</h1>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>+ New client</Button>
        )}
      </div>

      {showForm && (
        <ClientForm
          submitLabel="Add client"
          onCancel={() => setShowForm(false)}
          onSubmit={async (values) => {
            await createClient(values);
            setShowForm(false);
            if (!hasTutorialBeenSeen()) setShowTutorial(true);
          }}
        />
      )}

      {clients?.length === 0 && !showForm && <p>No clients yet.</p>}

      <ul className="client-list">
        {clients?.map((client) => (
          <li key={client.id}>
            <Link to={`/clients/${client.id}`} className="client-list-item">
              <span className="client-list-name">{client.displayName}</span>
              <span className="client-list-ref">{client.caseReference}</span>
            </Link>
          </li>
        ))}
      </ul>

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
