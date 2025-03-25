"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, ensureUser } from '../../firebase/auth';

// Create auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAnonymous: false
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setIsAnonymous(authUser?.isAnonymous || false);
      setLoading(false);
      
      // If no user is authenticated, sign in anonymously
      if (!authUser) {
        ensureUser().then((anonymousUser) => {
          if (anonymousUser) {
            setUser(anonymousUser);
            setIsAnonymous(anonymousUser.isAnonymous || false);
          }
        }).catch((error) => {
          console.error('Error ensuring user:', error);
        });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
