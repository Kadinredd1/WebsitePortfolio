import React from 'react';
//import Projects from './Projects';
import GitHub from './GitHub';
import AddProject from './AddProject';
import Admin from './Admin';
import LandingPage from './LandingPage';
import '../styles/navigation.scss';

const App: React.FC = () => {
  // Admin authentication state
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [{/*projectsRefreshKey*/}, setProjectsRefreshKey] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get initial section from URL hash or default to 'projects'
  const getInitialSection = (): string => {
    const hash = window.location.hash.replace('#', '');
    const validSections = ['landing', 'projects', 'github', 'admin'];
    if (isAdmin) validSections.push('add');
    return validSections.includes(hash) ? hash : 'landing';
  };

  const [section, setSection] = React.useState(getInitialSection);

  // Update URL hash when section changes
  const handleSectionChange = (newSection: string) => {
    setSection(newSection);
    window.location.hash = newSection;
    setMobileMenuOpen(false); // Close mobile menu when navigating
  };

  // Set initial hash if none exists
  React.useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = 'landing';
    }
  }, []);

  // Listen for hash changes (back/forward buttons)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = ['landing', 'projects', 'github', 'admin'];
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

  const handleProjectAdded = () => {
    // Force refresh of projects list
    setProjectsRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-bg">
      {/* Single-line Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <button className="nav-name" onClick={() => handleSectionChange('landing')}>
            <div className="logo">
              <div className="logo-icon">
                <div className="logo-line logo-line-1"></div>
                <div className="logo-line logo-line-2"></div>
                <div className="logo-line logo-line-3"></div>
                <div className="logo-k"></div>
              </div>
              <span className="logo-text">kadin.me</span>
            </div>
          </button>
          <div className="nav-buttons">
            {/* <button
              className={`nav-btn${section === 'projects' ? ' active' : ''}`}
              onClick={() => handleSectionChange('projects')}
            >
              Projects
            </button> */}
            <button
              className={`nav-btn${section === 'github' ? ' active' : ''}`}
              onClick={() => handleSectionChange('github')}
            >
              GitHub
            </button>
            {isAdmin && (
              <button
                className={`nav-btn${section === 'add' ? ' active' : ''}`}
                onClick={() => handleSectionChange('add')}
              >
                Add Project
              </button>
            )}
            <button
              className={`nav-btn${section === 'admin' ? ' active' : ''}`}
              onClick={handleAdminClick}
            >
              {isAdmin ? 'Admin' : 'Login'}
            </button>
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            ×
          </button>
          <div className="mobile-menu-content">
            <button
              className={`nav-btn${section === 'landing' ? ' active' : ''}`}
              onClick={() => handleSectionChange('landing')}
            >
              Home
            </button>
            {/* <button
              className={`nav-btn${section === 'projects' ? ' active' : ''}`}
              onClick={() => handleSectionChange('projects')}
            >
              Projects
            </button> */}
            <button
              className={`nav-btn${section === 'github' ? ' active' : ''}`}
              onClick={() => handleSectionChange('github')}
            >
              GitHub
            </button>
            {isAdmin && (
              <button
                className={`nav-btn${section === 'add' ? ' active' : ''}`}
                onClick={() => handleSectionChange('add')}
              >
                Add Project
              </button>
            )}
            <button
              className={`nav-btn${section === 'admin' ? ' active' : ''}`}
              onClick={handleAdminClick}
            >
              {isAdmin ? 'Admin' : 'Login'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {section === 'landing' && (
          <section className="content-section active">
            <LandingPage />
          </section>
        )}
        {/* <section className={`content-section${section === 'projects' ? ' active' : ''}`}>
          <Projects refreshKey={projectsRefreshKey} />
        </section> */}
        <section className={`content-section${section === 'github' ? ' active' : ''}`}>
          <GitHub />
        </section>
        {isAdmin && (
          <section className={`content-section${section === 'add' ? ' active' : ''}`}>
            <AddProject onProjectAdded={handleProjectAdded} />
          </section>
        )}
        {section === 'admin' && (
          <section className="content-section active">
            <Admin
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
              isAdmin={isAdmin}
            />
          </section>
        )}
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
