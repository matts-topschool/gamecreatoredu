/**
 * Marketplace Service - API calls for marketplace operations.
 */
import api from './api';

const marketplaceService = {
  /**
   * Browse/search marketplace listings.
   */
  browse: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.category) searchParams.append('category', params.category);
    if (params.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params.gradeLevel) searchParams.append('grade_level', params.gradeLevel);
    if (params.gameType) searchParams.append('game_type', params.gameType);
    if (params.tag) searchParams.append('tag', params.tag);
    if (params.isFree !== undefined) searchParams.append('is_free', params.isFree);
    if (params.minRating) searchParams.append('min_rating', params.minRating);
    if (params.sortBy) searchParams.append('sort_by', params.sortBy);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    
    const response = await api.get(`/marketplace/browse?${searchParams}`);
    return response.data;
  },

  /**
   * Get featured games.
   */
  getFeatured: async (limit = 12) => {
    const response = await api.get(`/marketplace/featured?limit=${limit}`);
    return response.data;
  },

  /**
   * Get all categories and subcategories.
   */
  getCategories: async () => {
    const response = await api.get('/marketplace/categories');
    return response.data;
  },

  /**
   * Get a single marketplace listing.
   */
  getListing: async (gameId) => {
    const response = await api.get(`/marketplace/game/${gameId}`);
    return response.data;
  },

  /**
   * Get listing by slug.
   */
  getListingBySlug: async (slug) => {
    const response = await api.get(`/marketplace/game/slug/${slug}`);
    return response.data;
  },

  /**
   * Publish a game to marketplace.
   */
  publish: async (data) => {
    const response = await api.post('/marketplace/publish', data);
    return response.data;
  },

  /**
   * Unpublish a game from marketplace.
   */
  unpublish: async (gameId) => {
    const response = await api.post(`/marketplace/unpublish/${gameId}`);
    return response.data;
  },

  /**
   * Create a review.
   */
  createReview: async (gameId, data) => {
    const response = await api.post(`/marketplace/game/${gameId}/reviews`, data);
    return response.data;
  },

  /**
   * Get reviews for a game.
   */
  getReviews: async (gameId, page = 1, limit = 10) => {
    const response = await api.get(`/marketplace/game/${gameId}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Acquire a game (free or purchase).
   */
  acquireGame: async (gameId) => {
    const response = await api.post(`/marketplace/game/${gameId}/acquire`);
    return response.data;
  },

  /**
   * Get user's game library.
   */
  getMyLibrary: async () => {
    const response = await api.get('/marketplace/my-library');
    return response.data;
  },

  /**
   * Get publisher profile.
   */
  getPublisher: async (userId) => {
    const response = await api.get(`/marketplace/publisher/${userId}`);
    return response.data;
  }
};

export default marketplaceService;
