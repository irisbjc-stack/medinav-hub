/**
 * Authentication Store
 * 
 * Manages user authentication state with localStorage persistence.
 * Replace with real auth (JWT, OAuth) later by updating the login/logout methods.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users, demoCredentials, User } from '@/services/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check demo credentials
        const validCredential = Object.values(demoCredentials).find(
          cred => cred.email === email && cred.password === password
        );
        
        if (validCredential) {
          const user = users.find(u => u.email === email);
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          }
        }
        
        set({ 
          isLoading: false, 
          error: 'Invalid email or password. Try the demo credentials shown below.' 
        });
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'healthcare-robot-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
