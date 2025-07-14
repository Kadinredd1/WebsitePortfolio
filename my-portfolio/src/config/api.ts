// API Configuration
// For development: use local IP
// For production: use deployed backend URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://website-portfolio-amber.vercel.app';
 
export const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/projects`,
  health: `${API_BASE_URL}/api/health`,
  admin: `${API_BASE_URL}/api/admin`,
} as const; 