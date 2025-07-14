import React, { useState } from 'react';
import '../styles/projects.scss';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

type Project = {
  _id: string;
  id?: number; // Keep for backward compatibility with sample data
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  projectURL?: string;
  demoURL?: string;
  date?: string;
  images?: string[];
  status: 'live' | 'development' | 'completed';
  completion: number;
  features: string[];
  challenges: string[];
  lessons: string[];
};

const mockProject = {
  _id: 'mock1',
  title: 'Lorem Ipsum Project',
  description: 'A sample project to demonstrate the portfolio app’s add project functionality.',
  longDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.',
  technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
  projectURL: 'https://github.com/example/lorem-ipsum-project',
  demoURL: 'https://lorem-ipsum-project.example.com',
  date: '2024-07-10',
  image: null, // Assuming no image for mock project
  status: 'completed' as const,
  completion: 100,
  features: ['User authentication', 'Responsive design', 'REST API integration'],
  challenges: ['Handling asynchronous data', 'Ensuring cross-browser compatibility'],
  lessons: ['Improved understanding of React hooks', 'Better state management practices']
};

interface ProjectsProps {
  refreshKey?: number;
}

const Projects: React.FC<ProjectsProps> = ({ refreshKey = 0 }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedProjects, setDisplayedProjects] = useState<number>(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageCarousel, setImageCarousel] = useState<{ projectId: string; currentIndex: number } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.projects);
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          setProjects([mockProject]);
        } else {
          setProjects(data);
        }
      } else {
        setError('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Network error while fetching projects');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, [refreshKey]);

  // Refetch projects when navigating to this page
  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#projects') {
        fetchProjects();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const openImageModal = (projectId: string, imageIndex: number = 0) => {
    setImageCarousel({ projectId, currentIndex: imageIndex });
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageCarousel(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!imageCarousel) return;
    
    const project = projects.find(p => p._id === imageCarousel.projectId);
    if (!project || !project.images) return;
    
    const totalImages = project.images.length;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = imageCarousel.currentIndex === 0 ? totalImages - 1 : imageCarousel.currentIndex - 1;
    } else {
      newIndex = imageCarousel.currentIndex === totalImages - 1 ? 0 : imageCarousel.currentIndex + 1;
    }
    
    setImageCarousel({ ...imageCarousel, currentIndex: newIndex });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#22c55e';
      case 'development': return '#fbbf24';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setDisplayedProjects(prev => prev + 3);
    setLoadingMore(false);
  };

  const hasMoreProjects = displayedProjects < projects.length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Show empty state when no projects exist
  if (projects.length === 0) {
    return (
      <div className="projects-container">
        <div className="no-projects-center">
          <p className="projects-counter">No projects yet</p>
        </div>
        <div className="empty-state">
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      {/* Project Counter */}
      <div className="projects-header">
        <h2> My Projects</h2>
        <p className="projects-counter">
          Showing {Math.min(displayedProjects, projects.length)} of {projects.length} projects
        </p>
      </div>
      
      <div className="projects-grid">
        {projects.slice(0, displayedProjects).map((project) => (
          <div 
            className="project-card" 
            key={project._id}
            onClick={() => handleCardClick(project)}
          >
            <div className="project-image">
              <div className="project-status" style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}>
                {project.status}
              </div>
              {project.images && project.images.length > 0 ? (
                <div className="project-image-container" onClick={(e) => {
                  e.stopPropagation();
                  openImageModal(project._id, 0);
                }}>
                  <img src={`${API_BASE_URL}${project.images[0]}`} alt={project.title} />
                  <div className="image-overlay">
                    <span>Click to view</span>
                  </div>
                </div>
              ) : (
                <div className="project-placeholder">
                  <span></span>
                  <p>Project Screenshot</p>
                </div>
              )}
              <div className="completion-bar" data-completion={project.completion}></div>
            </div>
            
            <div className="project-content">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">
                {project.description}
              </p>
              
              <div className="project-meta">
                <span className="project-date">{project.date}</span>
                <div className="project-links">
                  {project.projectURL && (
                    <a href={project.projectURL} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {project.demoURL && (
                    <a href={project.demoURL} target="_blank" rel="noopener noreferrer">
                      Demo
                    </a>
                  )}
                </div>
              </div>
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="project-tech">
                  {project.technologies.map((tech) => (
                    <span className="tech-tag" key={tech}>{tech}</span>
                  ))}
                </div>
              )}
              

            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreProjects && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="loading-spinner"></span>
                Loading...
              </>
            ) : (
              <>
                 Load More Projects ({projects.length - displayedProjects} remaining)
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal for detailed project view */}
      {isModalOpen && selectedProject && (
        <div className="project-modal-overlay" onClick={closeModal}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <h2>{selectedProject.title}</h2>
              <div className="modal-meta">
                <span className="project-status" style={{ backgroundColor: getStatusColor(selectedProject.status) + '20', color: getStatusColor(selectedProject.status) }}>
                  {selectedProject.status}
                </span>
                <span className="project-date">{selectedProject.date}</span>
              </div>
            </div>
            
            <div className="modal-content">
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div className="modal-section">
                  <h3>Screenshots</h3>
                  <div className="project-images-gallery">
                    {selectedProject.images.map((image, index) => {
                      // Use original image for modal display (remove 'resized-' prefix)
                      const originalImage = image.replace('/uploads/resized-', '/uploads/');
                      return (
                        <img 
                          key={index} 
                          src={`${API_BASE_URL}${originalImage}`} 
                          alt={`${selectedProject.title} screenshot ${index + 1}`}
                          className="project-screenshot"
                          onClick={() => openImageModal(selectedProject._id, index)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              
              {selectedProject.longDescription && selectedProject.longDescription.trim() !== '' && (
                <div className="modal-section">
                  <h3>Description</h3>
                  <p>{selectedProject.longDescription}</p>
                </div>
              )}
              
              {selectedProject.features && selectedProject.features.length > 0 && (
                <div className="modal-section">
                  <h3>Key Features</h3>
                  <ul>
                    {selectedProject.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="modal-section">
                  <h3>Technologies Used</h3>
                  <div className="tech-tags">
                    {selectedProject.technologies.map((tech) => (
                      <span className="tech-tag" key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProject.challenges && selectedProject.challenges.length > 0 && (
                <div className="modal-section">
                  <h3>Challenges Faced</h3>
                  <ul>
                    {selectedProject.challenges.map((challenge, index) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProject.lessons && selectedProject.lessons.length > 0 && (
                <div className="modal-section">
                  <h3>Key Learnings</h3>
                  <ul>
                    {selectedProject.lessons.map((lesson, index) => (
                      <li key={index}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {(selectedProject.projectURL || selectedProject.demoURL) && (
              <div className="modal-footer">
                <div className="modal-actions">
                  {selectedProject.projectURL && (
                    <a href={selectedProject.projectURL} target="_blank" rel="noopener noreferrer">
                      View on GitHub
                    </a>
                  )}
                  {selectedProject.demoURL && (
                    <a href={selectedProject.demoURL} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && imageCarousel && (() => {
        const project = projects.find(p => p._id === imageCarousel.projectId);
        if (!project || !project.images) return null;
        
        const currentImage = project.images[imageCarousel.currentIndex];
        
        return (
          <div className="image-modal-overlay" onClick={closeImageModal}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <button className="image-modal-close" onClick={closeImageModal}>×</button>
              
              <div className="image-modal-content">
                <img 
                  src={`${API_BASE_URL}${currentImage.replace('/uploads/resized-', '/uploads/')}`} 
                  alt={`${project.title} screenshot ${imageCarousel.currentIndex + 1}`}
                  className="modal-image"
                />
                
                {project.images.length > 1 && (
                  <>
                    <button 
                      className="image-nav-btn image-nav-prev" 
                      onClick={() => navigateImage('prev')}
                    >
                      ‹
                    </button>
                    <button 
                      className="image-nav-btn image-nav-next" 
                      onClick={() => navigateImage('next')}
                    >
                      ›
                    </button>
                    
                    <div className="image-indicators">
                      {project.images.map((_, index) => (
                        <button
                          key={index}
                          className={`image-indicator ${index === imageCarousel.currentIndex ? 'active' : ''}`}
                          onClick={() => setImageCarousel({ ...imageCarousel, currentIndex: index })}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="image-modal-footer">
                <span className="image-counter">
                  {imageCarousel.currentIndex + 1} / {project.images.length}
                </span>
                <span className="image-title">{project.title}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Projects;
