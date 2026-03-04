/**
 * Authentication service - handles login, register, logout API calls.
 */
import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register(email, password, displayName) {
    const response = await api.post('/auth/register', {
      email,
      password,
      display_name: displayName,
    });
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export default authService;
