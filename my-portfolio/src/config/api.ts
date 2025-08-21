// API Configuration
// For development: use local IP
// For production: use deployed backend URL
export const API_BASE_URL = 'https://websiteportfolio-7nwm.onrender.com';
 
export const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/projects`,
  health: `${API_BASE_URL}/api/health`,
  admin: `${API_BASE_URL}/api/admin`,
  // GitHub OAuth endpoints
  auth: {
    github: `${API_BASE_URL}/auth/github`,
    status: `${API_BASE_URL}/auth/status`,
    logout: `${API_BASE_URL}/auth/logout`,
  }
} as const; 