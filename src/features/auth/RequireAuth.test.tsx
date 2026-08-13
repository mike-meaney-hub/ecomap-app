import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { RequireAuth } from './RequireAuth';
import * as AuthContext from './AuthContext';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Protected content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  it('shows a loading state while the session is still resolving', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ session: null, user: null, loading: true });
    renderAt('/protected');
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects to /login when there is no session', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ session: null, user: null, loading: false });
    renderAt('/protected');
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children when a session is present', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      // Only the fields RequireAuth actually reads are needed for this test.
      session: {} as Session,
      user: null,
      loading: false,
    });
    renderAt('/protected');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
