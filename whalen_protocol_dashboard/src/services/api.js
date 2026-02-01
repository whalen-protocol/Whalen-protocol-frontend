import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('agentId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Agent APIs
export const agentAPI = {
  register: (data) => apiClient.post('/agents/register', data),
  getProfile: () => apiClient.get('/agents/profile'),
  getAgent: (id) => apiClient.get(`/agents/${id}`),
  getAllAgents: (limit = 50, offset = 0) =>
    apiClient.get('/agents', { params: { limit, offset } }),
  updateProfile: (data) => apiClient.patch('/agents/profile', data),
  getStats: (id) => apiClient.get(`/agents/${id}/stats`),
};

// Provider APIs
export const providerAPI = {
  registerCapability: (data) => apiClient.post('/providers/capabilities', data),
  getCapabilities: (providerId) =>
    apiClient.get(`/providers/capabilities/${providerId}`),
  updateCapability: (capabilityId, data) =>
    apiClient.patch(`/providers/capabilities/${capabilityId}`, data),
  deleteCapability: (capabilityId) =>
    apiClient.delete(`/providers/capabilities/${capabilityId}`),
  getMyCapabilities: () => apiClient.get('/providers/my-capabilities'),
};

// Discovery APIs
export const discoveryAPI = {
  search: (params) => apiClient.get('/discovery/search', { params }),
  getProviderDetails: (providerId) =>
    apiClient.get(`/discovery/providers/${providerId}`),
  findMatches: (data) => apiClient.post('/discovery/find-matches', data),
  getStats: () => apiClient.get('/discovery/stats'),
};

// Request APIs
export const requestAPI = {
  submit: (data) => apiClient.post('/requests', data),
  getRequest: (requestId) => apiClient.get(`/requests/${requestId}`),
  getMyRequests: (limit = 50, offset = 0) =>
    apiClient.get('/requests/my-requests', { params: { limit, offset } }),
  getAllRequests: (limit = 50, offset = 0, status = null) =>
    apiClient.get('/requests', { params: { limit, offset, status } }),
  updateRequest: (requestId, data) =>
    apiClient.patch(`/requests/${requestId}`, data),
  findMatches: (requestId) =>
    apiClient.post(`/requests/${requestId}/find-matches`),
  autoMatch: (requestId) => apiClient.post(`/requests/${requestId}/auto-match`),
};

// Match APIs
export const matchAPI = {
  getMatch: (matchId) => apiClient.get(`/matches/${matchId}`),
  getRequestMatches: (requestId) =>
    apiClient.get(`/matches/request/${requestId}`),
  getMyMatches: (limit = 50, offset = 0) =>
    apiClient.get('/matches/my-matches', { params: { limit, offset } }),
  getAllMatches: (limit = 50, offset = 0, status = null) =>
    apiClient.get('/matches', { params: { limit, offset, status } }),
  acceptMatch: (matchId) => apiClient.post(`/matches/${matchId}/accept`),
  completeMatch: (matchId) => apiClient.post(`/matches/${matchId}/complete`),
  cancelMatch: (matchId) => apiClient.post(`/matches/${matchId}/cancel`),
};

// Payment APIs
export const paymentAPI = {
  createPaymentIntent: (data) => apiClient.post('/payments/create-intent', data),
  confirmPayment: (data) => apiClient.post('/payments/confirm', data),
  getTransaction: (transactionId) => apiClient.get(`/payments/transaction/${transactionId}`),
  getMyTransactions: () => apiClient.get('/payments/my-transactions'),
  getPaymentStats: () => apiClient.get('/payments/stats'),
};

// Verification APIs
export const verificationAPI = {
  submitProof: (data) => apiClient.post('/verifications/submit-proof', data),
  verifyWork: (verificationId, data) => apiClient.post(`/verifications/${verificationId}/verify`, data),
  getVerification: (verificationId) => apiClient.get(`/verifications/${verificationId}`),
  getTransactionVerifications: (transactionId) => apiClient.get(`/verifications/transaction/${transactionId}`),
  getPendingVerifications: () => apiClient.get('/verifications/pending'),
  getVerificationStats: () => apiClient.get('/verifications/stats'),
  createDispute: (data) => apiClient.post('/verifications/dispute', data),
  resolveDispute: (verificationId, data) => apiClient.post(`/verifications/${verificationId}/resolve-dispute`, data),
};

export default apiClient;
