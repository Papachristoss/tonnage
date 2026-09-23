import { useState, useEffect, useCallback, useMemo } from 'react';
import { profileService } from '../services/api';
import { AuthContext } from './AuthContext';

const EMPTY_PROFILE = { username: null, profilePicture: null, isDemo: false };

export default function AuthProvider({ children }) {
  // Authenticated user state (auth-gating only - display info lives in headerProfile)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tonnage_user');
    const token = localStorage.getItem('tonnage_token');
    return token && savedUser ? { email: savedUser } : null;
  });

  // Lightweight profile info just for the header (username + avatar), kept in sync
  // by ProfilePage whenever the user edits their profile
  const [headerProfile, setHeaderProfile] = useState(EMPTY_PROFILE);

  useEffect(() => {
    // Listen for 401 unauthenticated signals from api.js interceptor
    const handleAuthChange = () => {
      setCurrentUser(null);
      setHeaderProfile(EMPTY_PROFILE);
    };
    window.addEventListener('tonnage_auth_changed', handleAuthChange);
    return () => window.removeEventListener('tonnage_auth_changed', handleAuthChange);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    profileService
      .get()
      .then((data) => setHeaderProfile({ username: data.username, profilePicture: data.profilePicture, isDemo: !!data.demo }))
      .catch(() => {
        // Non-critical for header display - silently ignore, ProfilePage will surface any real error
      });
  }, [currentUser]);

  // Also used after an email change: the JWT subject is the email, so the backend
  // issues a fresh token that we need to store immediately
  const signIn = useCallback((token, email) => {
    localStorage.setItem('tonnage_token', token);
    localStorage.setItem('tonnage_user', email);
    setCurrentUser({ email });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('tonnage_token');
    localStorage.removeItem('tonnage_user');
    setCurrentUser(null);
    setHeaderProfile(EMPTY_PROFILE);
  }, []);

  // Merge, so ProfilePage can update username/avatar without dropping isDemo
  const updateHeaderProfile = useCallback((changes) => setHeaderProfile((p) => ({ ...p, ...changes })), []);

  const value = useMemo(
    () => ({ currentUser, headerProfile, signIn, signOut, updateHeaderProfile }),
    [currentUser, headerProfile, signIn, signOut, updateHeaderProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
