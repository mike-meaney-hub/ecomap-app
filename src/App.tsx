import { HashRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { ClientListPage } from './features/clients/ClientListPage';
import { ClientDetailPage } from './features/clients/ClientDetailPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { EcomapEditorPage } from './features/ecomap-editor/EcomapEditorPage';
import { PrintExportPage } from './features/print/PrintExportPage';
import { ComparisonPage } from './features/comparison/ComparisonPage';
import { AuthProvider } from './features/auth/AuthContext';
import { RequireAuth } from './features/auth/RequireAuth';
import { LoginPage } from './features/auth/LoginPage';
import { supabase } from './lib/supabaseClient';
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
        <button className="app-header-logout" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
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
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Print view renders full-bleed, without the app chrome, but is still auth-gated */}
          <Route
            path="/clients/:clientId/ecomaps/:versionId/print"
            element={
              <RequireAuth>
                <PrintExportPage />
              </RequireAuth>
            }
          />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<ClientListPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="/clients/:clientId/ecomaps/compare" element={<ComparisonPage />} />
            <Route path="/clients/:clientId/ecomaps/:versionId" element={<EcomapEditorPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
