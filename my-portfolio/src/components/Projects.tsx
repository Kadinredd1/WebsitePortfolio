import React, { useState } from 'react';
import '../styles/projects.scss';
import { API_ENDPOINTS } from '../config/api';

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
  image?: string | null;
  status: 'live' | 'development' | 'completed';
  completion: number;
  features: string[];
  challenges: string[];
  lessons: string[];
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedProjects, setDisplayedProjects] = useState<number>(6);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch projects from backend
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.projects);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
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

    fetchProjects();
  }, []);

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCardExpand = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
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
        <div className="projects-header">
          <h2>My Projects</h2>
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
            className={`project-card ${expandedCards.has(project._id) ? 'expanded' : ''}`} 
            key={project._id}
            onClick={() => handleCardClick(project)}
          >
            <div className="project-image">
              <div className="project-status" style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}>
                {project.status}
              </div>
              {project.image ? (
                <img src={project.image} alt={project.title} />
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
                {expandedCards.has(project._id) 
                  ? project.longDescription 
                  : project.description
                }
              </p>
              
              <div className="project-meta">
                <span className="project-date">{project.date}</span>
                <div className="project-links">
                  {project.projectURL && (
                    <a href={project.projectURL} target="_blank" rel="noopener noreferrer" className="github">
                      GitHub
                    </a>
                  )}
                  {project.demoURL && (
                    <a href={project.demoURL} target="_blank" rel="noopener noreferrer" className="demo">
                      Demo
                    </a>
                  )}
                </div>
              </div>
              
              <div className="project-tech">
                {project.technologies.map((tech) => (
                  <span className="tech-tag" key={tech}>{tech}</span>
                ))}
              </div>
              
              <div className="project-actions">
                <button 
                  className="expand-btn"
                  onClick={(e) => handleCardExpand(project._id, e)}
                >
                  {expandedCards.has(project._id) ? 'Show Less' : 'Show More'}
                </button>
              </div>
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
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedProject.longDescription}</p>
              </div>
              
              <div className="modal-section">
                <h3>Key Features</h3>
                <ul>
                  {selectedProject.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="modal-section">
                <h3>Technologies Used</h3>
                <div className="tech-tags">
                  {selectedProject.technologies.map((tech) => (
                    <span className="tech-tag" key={tech}>{tech}</span>
                  ))}
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Challenges Faced</h3>
                <ul>
                  {selectedProject.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
              
              <div className="modal-section">
                <h3>Key Learnings</h3>
                <ul>
                  {selectedProject.lessons.map((lesson, index) => (
                    <li key={index}>{lesson}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="modal-actions">
                {selectedProject.projectURL && (
                  <a href={selectedProject.projectURL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View on GitHub
                  </a>
                )}
                {selectedProject.demoURL && (
                  <a href={selectedProject.demoURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Live Demo
                  </a>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
