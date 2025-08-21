import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import '../styles/admin.scss';

interface AdminProps {
  onLogin: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
  githubUsername?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
}

interface LoginForm {
  username: string;
  password: string;
}

const Admin: React.FC<AdminProps> = ({ onLogin, onLogout, isAdmin }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.status, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      
      const data = await response.json();
      
      if (data.authenticated) {
        setIsLoggedIn(true);
        setAdmin(data.user);
        fetchProjects();
        onLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  // Handle traditional login
  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.admin + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        setAdmin(data.admin);
        setLoginForm({ username: '', password: '' });
        fetchProjects();
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub login
  const handleGitHubLogin = () => {
    setLoading(true);
    setError('');
    window.location.href = API_ENDPOINTS.auth.github;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setIsLoggedIn(false);
      setAdmin(null);
      setProjects([]);
      onLogout();
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.projects);
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.projects}/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProjects(prev => prev.filter(project => project._id !== projectId));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      alert('Network error while deleting project');
    }
  };

  const editProject = (projectId: string) => {
    console.log('Edit project:', projectId);
    alert('Edit functionality coming soon!');
  };

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    live: projects.filter(p => p.status === 'live').length,
    development: projects.filter(p => p.status === 'development').length
  };

  // Login form component
  const LoginForm = () => (
    <div className="admin-container">
      <div className="login-form-container">
        <div className="login-form-content">
          <h2>Admin Login</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleTraditionalLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="login-divider"></div>
          
          <button 
            className="github-login-btn"
            onClick={handleGitHubLogin}
            disabled={loading}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {loading ? 'Connecting...' : 'Login with GitHub'}
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard component
  const Dashboard = () => (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h3>Project Management</h3>
          <p>Manage your portfolio projects</p>

          <div className="projects-list">
            {projects.map((project) => (
              <div key={project._id} className="project-item">
                <div className="project-info">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  <span className="project-status">{project.status}</span>
                </div>
                <div className="project-actions">
                  <button
                    onClick={() => editProject(project._id)}
                    className="edit-project-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="delete-project-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="no-projects">
              <p>No projects found. Add some projects to get started!</p>
            </div>
          )}
        </div>

        <div className="admin-section">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Projects</h4>
              <span className="stat-number">{projectStats.total}</span>
            </div>
            <div className="stat-card">
              <h4>Live Projects</h4>
              <span className="stat-number">{projectStats.live}</span>
            </div>
            <div className="stat-card">
              <h4>In Development</h4>
              <span className="stat-number">{projectStats.development}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isLoggedIn ? <Dashboard /> : <LoginForm />;
};

export default Admin; 