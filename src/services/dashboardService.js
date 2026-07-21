import { apiFetch, parseJsonOrThrow } from './apiClient';

export const dashboardService = {
  async getResumen() {
    const response = await apiFetch('/dashboard');
    return parseJsonOrThrow(response);
  },
};
