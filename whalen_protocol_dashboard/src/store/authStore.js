import { create } from 'zustand';
import { agentAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  register: async (name, type, walletAddress) => {
    set({ isLoading: true, error: null });
    try {
      const response = await agentAPI.register({
        name,
        type,
        walletAddress,
      });

      const { agent, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('agentId', agent.id);
      localStorage.setItem('agentName', agent.name);
      localStorage.setItem('agentType', agent.type);

      set({
        user: agent,
        token,
        isLoading: false,
      });

      return agent;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await agentAPI.getProfile();
      const user = response.data.data;

      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await agentAPI.updateProfile(updates);
      const user = response.data.data;

      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agentId');
    localStorage.removeItem('agentName');
    localStorage.removeItem('agentType');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),
}));
