/**
 * Authentication state management with Zustand.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
        set({ token });
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      /**
       * Register a new user
       */
      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(email, password, displayName);
          const { user, token } = response;
          
          localStorage.setItem('auth_token', token.access_token);
          set({ 
            user, 
            token: token.access_token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /**
       * Login with email and password
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password);
          const { user, token } = response;
          
          localStorage.setItem('auth_token', token.access_token);
          set({ 
            user, 
            token: token.access_token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /**
       * Logout current user
       */
      logout: async () => {
        await authService.logout();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      /**
       * Check and restore authentication state
       */
      checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return false;
        }

        try {
          const user = await authService.getCurrentUser();
          set({ user, token, isAuthenticated: true });
          return true;
        } catch (error) {
          localStorage.removeItem('auth_token');
          set({ user: null, token: null, isAuthenticated: false });
          return false;
        }
      },

      /**
       * Update user profile in store
       */
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'gamecraft-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
