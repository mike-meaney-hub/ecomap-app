import { useParams } from 'react-router-dom';

export function ClientDetailPage() {
  const { clientId } = useParams();
  return (
    <div className="page">
      <h1>Client {clientId}</h1>
    </div>
  );
}
