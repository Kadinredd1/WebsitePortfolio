import React from 'react';
import Projects from './Projects';
import GitHub from './GitHub';
import AddProject from './AddProject';
import Admin from './Admin';
import '../styles/navigation.scss';

const App: React.FC = () => {
  // Admin authentication state
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Get initial section from URL hash or default to 'projects'
  const getInitialSection = (): string => {
    const hash = window.location.hash.replace('#', '');
    const validSections = ['projects', 'github', 'admin'];
    if (isAdmin) validSections.push('add');
    return validSections.includes(hash) ? hash : 'projects';
  };

  const [section, setSection] = React.useState(getInitialSection);

  // Update URL hash when section changes
  const handleSectionChange = (newSection: string) => {
    setSection(newSection);
    window.location.hash = newSection;
  };

  // Set initial hash if none exists
  React.useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = 'projects';
    }
  }, []);

  // Listen for hash changes (back/forward buttons)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = ['projects', 'github', 'admin'];
      if (isAdmin) validSections.push('add');
      if (validSections.includes(hash)) {
        setSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdmin]);

  // Handler for admin/login button
  const handleAdminClick = () => {
    handleSectionChange('admin');
  };

  // Handler for successful admin login
  const handleAdminLogin = () => {
    setIsAdmin(true);
    setSection('admin');
    window.location.hash = 'admin';
  };

  // Handler for admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setSection('projects');
    window.location.hash = 'projects';
  };

  return (
    <div className="app-container">
      {/* Header with Title and Description */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="main-title">Tech Portfolio</h1>
          <p className="main-subtitle">Showcasing innovative projects and technical expertise</p>
        </div>
        <div className="header-admin-btn">
          <button className="admin-login-btn" onClick={handleAdminClick}>
            {isAdmin ? 'Admin' : 'Login'}
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="main-nav">
        <div className="nav-container">
          <button 
            className={`nav-btn ${section === 'projects' ? 'active' : ''}`} 
            onClick={() => handleSectionChange('projects')}
          >
            Projects
          </button>
          <button 
            className={`nav-btn ${section === 'github' ? 'active' : ''}`} 
            onClick={() => handleSectionChange('github')}
          >
            GitHub
          </button>
          {isAdmin && (
            <button 
              className={`nav-btn ${section === 'add' ? 'active' : ''}`} 
              onClick={() => handleSectionChange('add')}
            >
              Add Project
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <section className={`content-section ${section === 'projects' ? 'active' : ''}`}>
        <Projects />
      </section>
        <section className={`content-section ${section === 'github' ? 'active' : ''}`}>
        <GitHub />
      </section>
        {isAdmin && (
          <section className={`content-section ${section === 'add' ? 'active' : ''}`}>
        <AddProject />
      </section>
        )}
        {/* Admin page as a full page, not modal */}
        {section === 'admin' && (
          <section className="content-section active">
            <Admin 
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout} 
              isAdmin={isAdmin}
            />
          </section>
        )}
        {/* If not admin and tries to access add, show message */}
        {!isAdmin && section === 'add' && (
          <section className="content-section active">
            <div className="not-authorized">
              <h2>Not Authorized</h2>
              <p>You must be logged in as an admin to access this page.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
