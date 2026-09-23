import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext';

// Pages behind login: send guests to /login, remembering where they were headed
export function RequireAuth() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// Login/register: signed-in users go to the page they were originally headed to
// (set by RequireAuth), or the home page. This also handles the redirect right after login.
export function GuestOnly() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (currentUser) {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search || ''}` : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
