/**
 * Classroom Service - API calls for classroom management.
 */
import api from './api';

const classroomService = {
  /**
   * Create a new class.
   */
  createClass: async (data) => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  /**
   * List all classes for current teacher.
   */
  listClasses: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  /**
   * Get class details with students.
   */
  getClass: async (classId) => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  /**
   * Update class details.
   */
  updateClass: async (classId, data) => {
    const response = await api.patch(`/classes/${classId}`, data);
    return response.data;
  },

  /**
   * Delete a class.
   */
  deleteClass: async (classId) => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },

  /**
   * Add a student to a class.
   */
  addStudent: async (classId, displayName, email = null, studentId = null) => {
    const params = new URLSearchParams({ display_name: displayName });
    if (email) params.append('email', email);
    if (studentId) params.append('student_id', studentId);
    
    const response = await api.post(`/classes/${classId}/students?${params}`);
    return response.data;
  },

  /**
   * List students in a class.
   */
  listStudents: async (classId) => {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },

  /**
   * Remove a student from a class.
   */
  removeStudent: async (classId, studentId) => {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  /**
   * Join a class by code.
   */
  joinClass: async (joinCode, displayName, email = null) => {
    const params = new URLSearchParams({ display_name: displayName });
    if (email) params.append('email', email);
    
    const response = await api.post(`/classes/join/${joinCode}?${params}`);
    return response.data;
  },

  /**
   * Get available integration providers.
   */
  getIntegrationProviders: async () => {
    const response = await api.get('/classes/integrations/providers');
    return response.data;
  },

  /**
   * Connect a class to an LMS.
   */
  connectIntegration: async (classId, provider, credentials) => {
    const response = await api.post(`/classes/${classId}/integrations/connect`, {
      provider,
      credentials
    });
    return response.data;
  },

  /**
   * Sync roster from LMS.
   */
  syncRoster: async (classId) => {
    const response = await api.post(`/classes/${classId}/integrations/sync`);
    return response.data;
  },

  /**
   * Get integration status.
   */
  getIntegrationStatus: async (classId) => {
    const response = await api.get(`/classes/${classId}/integrations/status`);
    return response.data;
  }
};

export default classroomService;
