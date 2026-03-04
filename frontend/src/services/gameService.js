/**
 * Game service - handles game CRUD API calls.
 */
import api from './api';

export const gameService = {
  /**
   * List all games for current user
   */
  async listGames(params = {}) {
    const response = await api.get('/games', { params });
    return response.data;
  },

  /**
   * Get a single game by ID
   */
  async getGame(gameId) {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  /**
   * Get a game by slug
   */
  async getGameBySlug(slug) {
    const response = await api.get(`/games/slug/${slug}`);
    return response.data;
  },

  /**
   * Create a new game
   */
  async createGame(data) {
    const response = await api.post('/games', data);
    return response.data;
  },

  /**
   * Update game metadata
   */
  async updateGame(gameId, data) {
    const response = await api.put(`/games/${gameId}`, data);
    return response.data;
  },

  /**
   * Update game spec
   */
  async updateGameSpec(gameId, spec) {
    const response = await api.put(`/games/${gameId}/spec`, { spec });
    return response.data;
  },

  /**
   * Delete a game
   */
  async deleteGame(gameId) {
    const response = await api.delete(`/games/${gameId}`);
    return response.data;
  },

  /**
   * Publish a game
   */
  async publishGame(gameId) {
    const response = await api.post(`/games/${gameId}/publish`);
    return response.data;
  },

  /**
   * Duplicate a game
   */
  async duplicateGame(gameId) {
    const response = await api.post(`/games/${gameId}/duplicate`);
    return response.data;
  },

  /**
   * Get just the game spec
   */
  async getGameSpec(gameId) {
    const response = await api.get(`/games/${gameId}/spec`);
    return response.data;
  },
};

export default gameService;
