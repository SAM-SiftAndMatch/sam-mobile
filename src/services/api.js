// Axios Configuration for Future Backend Integration
import axios from 'axios';
import { CONFIG } from '../constants/config';

// 1. Create Axios Instance
const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 2. Request Interceptor (e.g. inject Auth Token when backend is ready)
apiClient.interceptors.request.use(
  async (config) => {
    // Example: const token = await AsyncStorage.getItem('userToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (Handle common errors, token expiration, etc.)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

/* 
========================================================================
 FUTURE REAL API EXAMPLES (Replace mockService.js calls with these later):
========================================================================

export const fetchJobsApi = (params) => apiClient.get('/jobs', { params });
export const fetchJobByIdApi = (id) => apiClient.get(`/jobs/${id}`);
export const createJobApi = (jobData) => apiClient.post('/jobs', jobData);
export const updateJobApi = (id, jobData) => apiClient.put(`/jobs/${id}`, jobData);
export const deleteJobApi = (id) => apiClient.delete(`/jobs/${id}`);

export const fetchApplicationsApi = (params) => apiClient.get('/applications', { params });
export const createApplicationApi = (data) => apiClient.post('/applications', data);
export const updateApplicationStatusApi = (id, status) => apiClient.patch(`/applications/${id}/status`, { status });

export const loginApi = (credentials) => apiClient.post('/auth/login', credentials);
export const registerApi = (userData) => apiClient.post('/auth/register', userData);
export const subscribePremiumApi = (planId) => apiClient.post('/subscriptions', { planId });

*/

export default apiClient;
