/**
 * Leaderboard Service - API calls for game results and leaderboards.
 */
import api from './api';

const leaderboardService = {
  /**
   * Submit a game result when player completes a game.
   */
  submitResult: async (result) => {
    const response = await api.post('/leaderboard/results', result);
    return response.data;
  },

  /**
   * Get the leaderboard for a specific game.
   */
  getGameLeaderboard: async (gameId, options = {}) => {
    const params = new URLSearchParams();
    if (options.type) params.append('type', options.type);
    if (options.scope) params.append('scope', options.scope);
    if (options.classId) params.append('class_id', options.classId);
    if (options.limit) params.append('limit', options.limit);
    
    const response = await api.get(`/leaderboard/game/${gameId}?${params}`);
    return response.data;
  },

  /**
   * Get current user's rank for a game.
   */
  getMyRank: async (gameId) => {
    const response = await api.get(`/leaderboard/game/${gameId}/my-rank`);
    return response.data;
  },

  /**
   * Get current player's overall stats.
   */
  getPlayerStats: async () => {
    const response = await api.get('/leaderboard/player/stats');
    return response.data;
  },

  /**
   * Get a player's game history.
   */
  getPlayerHistory: async (playerId, options = {}) => {
    const params = new URLSearchParams();
    if (options.gameId) params.append('game_id', options.gameId);
    if (options.limit) params.append('limit', options.limit);
    
    const response = await api.get(`/leaderboard/player/${playerId}/history?${params}`);
    return response.data;
  }
};

export default leaderboardService;
