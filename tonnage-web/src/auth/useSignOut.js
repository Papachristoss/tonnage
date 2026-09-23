import { startTransition, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';

// Signs out and goes to /login in a single update. React Router runs navigations as
// transitions; if signOut() rendered first, RequireAuth would redirect on its own
// (remembering the current page as "from" and dropping any state we pass, like a notice).
export function useSignOut() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return useCallback(
    (state) => {
      startTransition(() => {
        signOut();
        navigate('/login', { replace: true, state });
      });
    },
    [signOut, navigate]
  );
}
