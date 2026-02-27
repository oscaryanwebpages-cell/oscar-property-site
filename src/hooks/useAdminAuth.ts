import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// Admin auth state type
export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

// Admin hook return type
export interface UseAdminAuthReturn extends AdminAuthState {
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// List of admin email addresses (can be moved to Firestore for dynamic management)
const ADMIN_EMAILS = [
  'oscar@oscaryan.my', // Replace with actual admin emails
  // Add more admin emails as needed
];

// Check if user is admin
const checkAdminStatus = (user: User | null): boolean => {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email || '');
};

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        user,
        isAdmin: checkAdminStatus(user),
        isLoading: false,
        error: null,
      });
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<UserCredential> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is admin
      if (!checkAdminStatus(credential.user)) {
        await signOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }

      setState({
        user: credential.user,
        isAdmin: true,
        isLoading: false,
        error: null,
      });

      return credential;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await signOut(auth);
      setState({
        user: null,
        isAdmin: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    clearError,
  };
};

// Helper hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  return isAuthenticated;
};

// Helper hook to get current user
export const useCurrentUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return user;
};
