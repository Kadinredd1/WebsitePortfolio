// API Configuration
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
 
export const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/projects`,
  health: `${API_BASE_URL}/api/health`,
  admin: `${API_BASE_URL}/api/admin`,
  auth: {
    github: `${API_BASE_URL}/auth/github`,
    status: `${API_BASE_URL}/auth/status`,
    logout: `${API_BASE_URL}/auth/logout`,
  }
} as const; 