import { HashRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { ClientListPage } from './features/clients/ClientListPage';
import { ClientDetailPage } from './features/clients/ClientDetailPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { EcomapEditorPage } from './features/ecomap-editor/EcomapEditorPage';
import { PrintExportPage } from './features/print/PrintExportPage';
import './App.css';

function AppLayout() {
  return (
    <>
      <header className="app-header no-print">
        <Link to="/" className="app-header-brand">Ecomap</Link>
        <nav>
          <Link to="/">Clients</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Print view renders full-bleed, without the app chrome */}
        <Route path="/clients/:clientId/ecomaps/:versionId/print" element={<PrintExportPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<ClientListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/clients/:clientId" element={<ClientDetailPage />} />
          <Route path="/clients/:clientId/ecomaps/:versionId" element={<EcomapEditorPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
