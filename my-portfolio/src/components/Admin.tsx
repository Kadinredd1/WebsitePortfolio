import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import '../styles/admin.scss';

interface AdminProps {
  onLogin?: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
}

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
}

interface LoginForm {
  username: string;
  password: string;
}

const Admin: React.FC<AdminProps> = ({ onLogin, onLogout, isAdmin }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [_admin, setAdmin] = useState<Admin | null>(null);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.admin}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        setIsLoggedIn(true);
        fetchProjects();
        if (onLogin) onLogin();
      } else {
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminToken');
      setIsLoggedIn(false);
      setAdmin(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.admin}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setAdmin(data.admin);
        setIsLoggedIn(true);
        setLoginForm({ username: '', password: '' });
        fetchProjects();
        if (onLogin) onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_ENDPOINTS.admin}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setIsLoggedIn(false);
      setAdmin(null);
      setProjects([]);
      if (onLogout) onLogout();
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

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <div className="login-header">
            <h2>Admin Login</h2>
            <p>Access admin panel to manage projects</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                required
                placeholder="Enter username or email"
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
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        {onLogout && isAdmin && (
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        )}
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
              <span className="stat-number">{projects.length}</span>
            </div>
            <div className="stat-card">
              <h4>Live Projects</h4>
              <span className="stat-number">
                {projects.filter(p => p.status === 'live').length}
              </span>
            </div>
            <div className="stat-card">
              <h4>In Development</h4>
              <span className="stat-number">
                {projects.filter(p => p.status === 'development').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 