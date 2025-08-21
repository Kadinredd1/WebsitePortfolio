import React from 'react';
import Projects from './Projects';
import GitHub from './GitHub';
import AddProject from './AddProject';
import Admin from './Admin';
import LandingPage from './LandingPage';
import '../styles/navigation.scss';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [projectsRefreshKey, setProjectsRefreshKey] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Valid sections configuration
  const VALID_SECTIONS = ['landing', 'projects', 'github', 'admin'] as const;
  const ADMIN_SECTIONS = [...VALID_SECTIONS, 'add'] as const;

  // Get initial section from URL hash or default to 'landing'
  const getInitialSection = (): string => {
    const hash = window.location.hash.replace('#', '');
    const validSections = isAdmin ? ADMIN_SECTIONS : VALID_SECTIONS;
    return validSections.includes(hash as any) ? hash : 'landing';
  };

  const [section, setSection] = React.useState(getInitialSection);

  // Update URL hash when section changes
  const handleSectionChange = (newSection: string) => {
    setSection(newSection);
    window.location.hash = newSection;
    setMobileMenuOpen(false);
  };

  // Set initial hash if none exists
  React.useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = 'landing';
    }
  }, []);

  // Handle GitHub OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const token = urlParams.get('token');
    
    if (loginSuccess === 'success' && token) {
      localStorage.setItem('adminToken', token);
      setIsAdmin(true);
      setSection('admin');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }, []);

  // Listen for hash changes (back/forward buttons)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = isAdmin ? ADMIN_SECTIONS : VALID_SECTIONS;
      if (validSections.includes(hash as any)) {
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
    setSection('landing');
    window.location.hash = 'landing';
  };

  const handleProjectAdded = () => {
    setProjectsRefreshKey(prev => prev + 1);
  };

  // Navigation button component
  const NavButton = ({ sectionName, children }: { sectionName: string; children: React.ReactNode }) => (
    <button
      className={`nav-btn${section === sectionName ? ' active' : ''}`}
      onClick={() => handleSectionChange(sectionName)}
    >
      {children}
    </button>
  );

  // Logo component
  const Logo = () => (
    <div className="logo">
      <div className="logo-icon">
        <div className="logo-line logo-line-1"></div>
        <div className="logo-line logo-line-2"></div>
        <div className="logo-line logo-line-3"></div>
        <div className="logo-k"></div>
      </div>
      <span className="logo-text">kadin.me</span>
    </div>
  );

  return (
    <div className="app-bg">
      {/* Single-line Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <button className="nav-name" onClick={() => handleSectionChange('landing')}>
            <Logo />
          </button>
          <div className="nav-buttons">
            <NavButton sectionName="github">GitHub</NavButton>
            {isAdmin && (
              <NavButton sectionName="add">Add Project</NavButton>
            )}
            <NavButton sectionName="admin">
              {isAdmin ? 'Admin' : 'Login'}
            </NavButton>
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
        <div className="mobile-menu open">
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            ×
          </button>
          <div className="mobile-menu-content">
            <NavButton sectionName="landing">Home</NavButton>
            <NavButton sectionName="github">GitHub</NavButton>
            {isAdmin && (
              <NavButton sectionName="add">Add Project</NavButton>
            )}
            <NavButton sectionName="admin">
              {isAdmin ? 'Admin' : 'Login'}
            </NavButton>
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
