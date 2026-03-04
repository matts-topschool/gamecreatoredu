/**
 * Game editor state management with Zustand.
 */
import { create } from 'zustand';
import gameService from '../services/gameService';

const useGameStore = create((set, get) => ({
  // State
  games: [],
  currentGame: null,
  currentSpec: null,
  isLoading: false,
  error: null,
  isDirty: false, // Track unsaved changes

  // Actions
  setGames: (games) => set({ games }),
  setCurrentGame: (game) => set({ currentGame: game, currentSpec: game?.spec }),
  setCurrentSpec: (spec) => set({ currentSpec: spec, isDirty: true }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setDirty: (isDirty) => set({ isDirty }),

  /**
   * Fetch all games for current user
   */
  fetchGames: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const games = await gameService.listGames(params);
      set({ games, isLoading: false });
      return games;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to fetch games';
      set({ error: message, isLoading: false });
      return [];
    }
  },

  /**
   * Fetch a single game
   */
  fetchGame: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.getGame(gameId);
      set({ currentGame: game, currentSpec: game.spec, isLoading: false, isDirty: false });
      return game;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to fetch game';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Create a new game
   */
  createGame: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.createGame(data);
      set((state) => ({
        games: [game, ...state.games],
        currentGame: game,
        currentSpec: game.spec,
        isLoading: false,
        isDirty: false,
      }));
      return game;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create game';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Update game metadata
   */
  updateGame: async (gameId, data) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.updateGame(gameId, data);
      set((state) => ({
        games: state.games.map((g) => (g.id === gameId ? game : g)),
        currentGame: state.currentGame?.id === gameId ? game : state.currentGame,
        isLoading: false,
      }));
      return game;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update game';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Save game spec
   */
  saveSpec: async () => {
    const { currentGame, currentSpec } = get();
    if (!currentGame || !currentSpec) return null;

    set({ isLoading: true, error: null });
    try {
      const game = await gameService.updateGameSpec(currentGame.id, currentSpec);
      set({
        currentGame: game,
        currentSpec: game.spec,
        isLoading: false,
        isDirty: false,
      });
      return game;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to save spec';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Delete a game
   */
  deleteGame: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      await gameService.deleteGame(gameId);
      set((state) => ({
        games: state.games.filter((g) => g.id !== gameId),
        currentGame: state.currentGame?.id === gameId ? null : state.currentGame,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete game';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Publish a game
   */
  publishGame: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.publishGame(gameId);
      set((state) => ({
        games: state.games.map((g) => (g.id === gameId ? game : g)),
        currentGame: state.currentGame?.id === gameId ? game : state.currentGame,
        isLoading: false,
      }));
      return game;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to publish game';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Duplicate a game
   */
  duplicateGame: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.duplicateGame(gameId);
      set((state) => ({
        games: [game, ...state.games],
        isLoading: false,
      }));
      return game;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to duplicate game';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Update spec locally (without saving)
   */
  updateSpecLocally: (updates) => {
    set((state) => ({
      currentSpec: { ...state.currentSpec, ...updates },
      isDirty: true,
    }));
  },

  /**
   * Reset store
   */
  reset: () => set({
    games: [],
    currentGame: null,
    currentSpec: null,
    isLoading: false,
    error: null,
    isDirty: false,
  }),
}));

export default useGameStore;
