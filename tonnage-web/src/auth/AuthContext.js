import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// { currentUser, headerProfile: { username, profilePicture, isDemo }, signIn, signOut, updateHeaderProfile }
export const useAuth = () => useContext(AuthContext);
