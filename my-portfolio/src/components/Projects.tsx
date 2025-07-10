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

const sampleProjects: Project[] = [
  {
    _id: 'sample-1',
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A comprehensive full-stack e-commerce solution built with modern web technologies...',
    longDescription: 'A full-featured e-commerce platform with user authentication, product management, shopping cart, payment processing, and admin dashboard. Built with React frontend and Node.js backend, featuring real-time inventory updates and comprehensive analytics.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'Redux', 'Express'],
    projectURL: 'https://github.com/yourname/ecommerce',
    demoURL: 'https://ecommerce-demo.com',
    date: '2024-01-15',
    image: null,
    status: 'live',
    completion: 100,
    features: [
      'User authentication and authorization',
      'Product catalog with search and filtering',
      'Shopping cart and checkout process',
      'Payment integration with Stripe',
      'Order management and tracking',
      'Admin dashboard for inventory management'
    ],
    challenges: [
      'Implementing secure payment processing',
      'Optimizing database queries for large product catalogs',
      'Managing real-time inventory updates'
    ],
    lessons: [
      'Importance of proper error handling in payment flows',
      'Database indexing strategies for performance',
      'State management patterns for complex applications'
    ]
  },
  {
    _id: 'sample-2',
    id: 2,
    title: 'Data Visualization Dashboard',
    description: 'An interactive dashboard for comprehensive data analytics...',
    longDescription: 'A real-time data visualization dashboard that processes and displays complex datasets through interactive charts and graphs. Features include data filtering, export capabilities, and customizable dashboards for different user roles.',
    technologies: ['React', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL', 'Chart.js'],
    projectURL: 'https://github.com/yourname/dashboard',
    demoURL: 'https://dashboard-demo.com',
    date: '2024-02-20',
    image: null,
    status: 'development',
    completion: 75,
    features: [
      'Interactive charts and graphs',
      'Real-time data updates',
      'Custom dashboard creation',
      'Data export functionality',
      'User role-based access control',
      'Mobile-responsive design'
    ],
    challenges: [
      'Optimizing chart rendering performance',
      'Handling large datasets efficiently',
      'Implementing real-time data synchronization'
    ],
    lessons: [
      'WebSocket implementation for real-time features',
      'Chart library optimization techniques',
      'Data processing and transformation strategies'
    ]
  },
  {
    _id: 'sample-3',
    id: 3,
    title: 'Task Management App',
    description: 'A collaborative task management application with team features...',
    longDescription: 'A comprehensive task management application designed for teams to collaborate on projects. Features include task assignment, progress tracking, file sharing, and team communication tools.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Socket.io', 'MongoDB', 'AWS S3'],
    projectURL: 'https://github.com/yourname/taskmanager',
    demoURL: 'https://taskmanager-demo.com',
    date: '2024-03-10',
    image: null,
    status: 'completed',
    completion: 90,
    features: [
      'Task creation and assignment',
      'Real-time collaboration',
      'File upload and sharing',
      'Progress tracking and reporting',
      'Team communication tools',
      'Mobile app support'
    ],
    challenges: [
      'Implementing real-time collaboration features',
      'Managing file uploads and storage',
      'Ensuring data consistency across multiple users'
    ],
    lessons: [
      'WebSocket patterns for real-time applications',
      'File handling and cloud storage integration',
      'Conflict resolution in collaborative applications'
    ]
  },
  {
    _id: 'sample-4',
    id: 4,
    title: 'Mobile App Development',
    description: 'Cross-platform mobile application with React Native',
    longDescription: 'A feature-rich mobile application built with React Native that works seamlessly across iOS and Android platforms. Includes user authentication, real-time messaging, and offline functionality.',
    technologies: ['React Native', 'TypeScript', 'Firebase', 'Redux', 'React Navigation'],
    projectURL: 'https://github.com/yourname/mobile-app',
    demoURL: 'https://mobile-demo.com',
    date: '2024-01-03T14:15:00Z',
    image: null,
    status: 'live',
    completion: 95,
    features: [
      'Cross-platform compatibility',
      'User authentication and profiles',
      'Real-time messaging system',
      'Offline data synchronization',
      'Push notifications',
      'File upload and sharing'
    ],
    challenges: [
      'Ensuring consistent UI across platforms',
      'Implementing offline functionality',
      'Optimizing app performance'
    ],
    lessons: [
      'Platform-specific considerations',
      'State management in mobile apps',
      'Performance optimization techniques'
    ]
  },
  {
    _id: 'sample-5',
    id: 5,
    title: 'Blockchain Smart Contracts',
    description: 'Decentralized application with smart contracts',
    longDescription: 'A decentralized application (DApp) built on Ethereum blockchain with smart contracts for secure and transparent transactions. Features include token management, voting system, and decentralized storage.',
    technologies: ['Solidity', 'Web3.js', 'React', 'Truffle', 'Ganache', 'MetaMask'],
    projectURL: 'https://github.com/yourname/blockchain-dapp',
    demoURL: 'https://dapp-demo.com',
    date: '2023-12-28T09:45:00Z',
    image: null,
    status: 'development',
    completion: 70,
    features: [
      'Smart contract development',
      'Token creation and management',
      'Decentralized voting system',
      'Web3 integration',
      'MetaMask wallet connection',
      'Gas optimization'
    ],
    challenges: [
      'Smart contract security',
      'Gas cost optimization',
      'User experience with blockchain'
    ],
    lessons: [
      'Blockchain security best practices',
      'Gas optimization strategies',
      'DApp user experience design'
    ]
  },
  {
    _id: 'sample-6',
    id: 6,
    title: 'Real-time Chat Application',
    description: 'WebSocket-based real-time messaging platform',
    longDescription: 'A real-time chat application with features like group messaging, file sharing, and message encryption. Built with WebSocket technology for instant message delivery.',
    technologies: ['Node.js', 'Socket.io', 'React', 'MongoDB', 'JWT', 'Express'],
    projectURL: 'https://github.com/yourname/chat-app',
    demoURL: 'https://chat-demo.com',
    date: '2023-12-20T16:30:00Z',
    image: null,
    status: 'live',
    completion: 85,
    features: [
      'Real-time messaging',
      'Group chat functionality',
      'File and image sharing',
      'Message encryption',
      'User presence indicators',
      'Message history and search'
    ],
    challenges: [
      'Scaling WebSocket connections',
      'Implementing message encryption',
      'Handling offline users'
    ],
    lessons: [
      'WebSocket implementation patterns',
      'Real-time application architecture',
      'Security in messaging applications'
    ]
  },
  {
    _id: 'sample-7',
    id: 7,
    title: 'AI-Powered Recommendation System',
    description: 'Content recommendation engine using machine learning',
    longDescription: 'An intelligent recommendation system that analyzes user behavior and preferences to suggest relevant content. Uses collaborative filtering and content-based algorithms.',
    technologies: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Flask', 'Redis'],
    projectURL: 'https://github.com/yourname/recommendation-engine',
    demoURL: 'https://recommend-demo.com',
    date: '2023-12-15T11:20:00Z',
    image: null,
    status: 'completed',
    completion: 88,
    features: [
      'Collaborative filtering algorithms',
      'Content-based recommendations',
      'Real-time user behavior tracking',
      'A/B testing framework',
      'Recommendation quality metrics',
      'Scalable architecture'
    ],
    challenges: [
      'Cold start problem',
      'Scalability of recommendation algorithms',
      'Balancing accuracy and performance'
    ],
    lessons: [
      'Recommendation system design',
      'Machine learning in production',
      'Performance optimization techniques'
    ]
  },
  {
    _id: 'sample-8',
    id: 8,
    title: 'Cloud Infrastructure Automation',
    description: 'Infrastructure as Code with Terraform and AWS',
    longDescription: 'A comprehensive infrastructure automation project using Terraform to manage cloud resources on AWS. Includes CI/CD pipelines, monitoring, and disaster recovery.',
    technologies: ['Terraform', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Prometheus'],
    projectURL: 'https://github.com/yourname/terraform-infra',
    demoURL: 'https://infra-demo.com',
    date: '2023-12-10T13:45:00Z',
    image: null,
    status: 'live',
    completion: 92,
    features: [
      'Infrastructure as Code',
      'Multi-environment deployment',
      'Automated CI/CD pipelines',
      'Monitoring and alerting',
      'Disaster recovery setup',
      'Cost optimization'
    ],
    challenges: [
      'Managing complex infrastructure',
      'Ensuring security compliance',
      'Optimizing cloud costs'
    ],
    lessons: [
      'Infrastructure automation best practices',
      'Cloud security and compliance',
      'Cost management strategies'
    ]
  },
  {
    _id: 'sample-9',
    id: 9,
    title: 'Progressive Web App (PWA)',
    description: 'Offline-capable web application with native app features',
    longDescription: 'A Progressive Web App that provides native app-like experience with offline functionality, push notifications, and app installation capabilities.',
    technologies: ['React', 'Service Workers', 'Web App Manifest', 'IndexedDB', 'Push API'],
    projectURL: 'https://github.com/yourname/pwa-app',
    demoURL: 'https://pwa-demo.com',
    date: '2023-12-05T10:30:00Z',
    image: null,
    status: 'completed',
    completion: 87,
    features: [
      'Offline functionality',
      'Push notifications',
      'App installation',
      'Background sync',
      'Responsive design',
      'Fast loading times'
    ],
    challenges: [
      'Implementing service workers',
      'Managing offline data',
      'Cross-browser compatibility'
    ],
    lessons: [
      'PWA development patterns',
      'Offline-first architecture',
      'Progressive enhancement'
    ]
  }
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
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

  return (
    <div className="projects-container">
      {/* Project Counter */}
      <div className="projects-header">
        <h2>📁 My Projects</h2>
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
                  <span>📸</span>
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
                📂 Load More Projects ({projects.length - displayedProjects} remaining)
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
