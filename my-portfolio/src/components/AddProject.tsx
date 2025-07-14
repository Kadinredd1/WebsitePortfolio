import React, { useState } from 'react';
import '../styles/addProject.scss';
import { API_ENDPOINTS } from '../config/api';
import Select from 'react-select';

// Predefined list of technologies
const TECHNOLOGIES = [
  // Frontend
  'Angular', 'Ant Design', 'Bootstrap', 'Chakra UI', 'CSS3', 'Gatsby', 'HTML5', 'JavaScript', 'Less', 'Material-UI', 'Next.js', 'Nuxt.js', 'React', 'Sass', 'Styled Components', 'Svelte', 'Tailwind CSS', 'TypeScript', 'Vue.js',
  
  // Backend
  '.NET', 'ASP.NET Core', 'C#', 'Django', 'Express.js', 'FastAPI', 'Fastify', 'Flask', 'Gin', 'Go', 'Java', 'Koa', 'Laravel', 'NestJS', 'Node.js', 'PHP', 'Python', 'Ruby', 'Ruby on Rails', 'Spring Boot', 'Symfony',
  
  // Databases
  'DynamoDB', 'Elasticsearch', 'Firebase', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite', 'Supabase',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'CI/CD', 'DigitalOcean', 'Docker', 'GitHub Actions', 'Google Cloud', 'Heroku', 'Kubernetes', 'Netlify', 'Vercel',
  
  // Tools & Libraries
  'Babel', 'Cypress', 'ESLint', 'Git', 'GraphQL', 'Jest', 'JWT', 'Mongoose', 'OAuth', 'Prettier', 'Prisma', 'REST API', 'Sequelize', 'Socket.io', 'Storybook', 'Vite', 'WebSocket', 'Webpack',
  
  // Mobile & Desktop
  'Cordova', 'Electron', 'Flutter', 'Ionic', 'React Native',
  
  // AI & ML
  'Data Science', 'Machine Learning', 'OpenAI API', 'PyTorch', 'TensorFlow'
].sort();

interface ProjectFormData {
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  projectURL: string;
  demoURL: string;
  status: 'live' | 'development' | 'completed';
  features: string[];
  challenges: string[];
  lessons: string[];
  images?: File[];
}

interface AddProjectProps {
  onProjectAdded?: () => void;
}

const AddProject: React.FC<AddProjectProps> = ({ onProjectAdded }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    longDescription: '',
    technologies: [],
    projectURL: '',
    demoURL: '',
    status: 'development',
    features: [''],
    challenges: [''],
    lessons: [''],
    images: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const techOptions = TECHNOLOGIES.map(tech => ({ label: tech, value: tech }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleArrayFieldChange = (field: keyof ProjectFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: keyof ProjectFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayField = (field: keyof ProjectFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
          // Handle multiple images
          value.forEach((file: File) => {
            formDataToSend.append('images', file);
          });
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.projects, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: 'Project has been successfully added' });
        // Reset form
        setFormData({
          title: '',
          description: '',
          longDescription: '',
          technologies: [],
          projectURL: '',
          demoURL: '',
          status: 'development',
          features: [''],
          challenges: [''],
          lessons: [''],
          images: [],
        });
        
        // Notify parent component that a project was added
        if (onProjectAdded) {
          onProjectAdded();
        }
        
        // Navigate to projects page after a short delay
        setTimeout(() => {
          window.location.hash = 'projects';
        }, 1500);
      } else {
        const errorData = await response.json();
        setSubmitMessage({ type: 'error', text: errorData.message || 'Failed to add project' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-project-container">
      {submitMessage && (
        <div className={`submit-message ${submitMessage.type}`}>
          {submitMessage.text}
        </div>
      )}

      <div className="form-header">
        <h2>Add New Project</h2>
        <p>Fill out the form below to add a new project to your portfolio</p>
      </div>

      <form className="add-project-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter project title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Project Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe your project, its features, and what you learned"
              rows={5}
            />
          </div>

          <div className="form-group">
            <label htmlFor="longDescription">Project Long Description *</label>
            <textarea
              id="longDescription"
              name="longDescription"
              value={formData.longDescription}
              onChange={handleInputChange}
              required
              placeholder="Provide a detailed description of your project"
              rows={7}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Project Details</h3>
          
          <div className="form-group">
            <label htmlFor="status">Project Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="development">In Development</option>
              <option value="completed">Completed</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="projectURL">GitHub URL (Optional)</label>
            <input
              type="url"
              id="projectURL"
              name="projectURL"
              value={formData.projectURL}
              onChange={handleInputChange}
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="form-group">
            <label htmlFor="demoURL">Live Demo URL (Optional)</label>
            <input
              type="url"
              id="demoURL"
              name="demoURL"
              value={formData.demoURL}
              onChange={handleInputChange}
              placeholder="https://your-demo-site.com"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Technologies Used</h3>
          
          <div className="tech-input-group">
            <Select
              options={techOptions}
              isMulti
              isClearable={false}
              placeholder="Select or search technologies..."
              value={formData.technologies.map(tech => ({ label: tech, value: tech }))}
              onChange={(selected) => {
                setFormData(prev => ({
                  ...prev,
                  technologies: selected ? selected.map((opt: any) => opt.value) : []
                }));
              }}
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, width: '100%' }),
                control: (base) => ({ ...base, width: '100%' }),
                valueContainer: (base) => ({ ...base, width: '100%' }),
                input: (base) => ({ ...base, width: '100%', minWidth: 0, color: '#fff' }),
                menu: (base) => ({ ...base, width: '100%' }),
              }}
            />
          </div>

          <div className="tech-tags">
            {formData.technologies.map((tech, index) => (
              <span key={index} className="tech-tag">
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="remove-tech"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Project Features</h3>
          {formData.features.map((feature, index) => (
            <div key={index} className="array-field-group">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleArrayFieldChange('features', index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
              />
              {formData.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('features', index)}
                  className="remove-field-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('features')}
            className="add-field-btn"
          >
            + Add Feature
          </button>
        </div>

        <div className="form-section">
          <h3>Challenges Faced</h3>
          {formData.challenges.map((challenge, index) => (
            <div key={index} className="array-field-group">
              <input
                type="text"
                value={challenge}
                onChange={(e) => handleArrayFieldChange('challenges', index, e.target.value)}
                placeholder={`Challenge ${index + 1}`}
              />
              {formData.challenges.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('challenges', index)}
                  className="remove-field-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('challenges')}
            className="add-field-btn"
          >
            + Add Challenge
          </button>
        </div>

        <div className="form-section">
          <h3>Key Learnings</h3>
          {formData.lessons.map((lesson, index) => (
            <div key={index} className="array-field-group">
              <input
                type="text"
                value={lesson}
                onChange={(e) => handleArrayFieldChange('lessons', index, e.target.value)}
                placeholder={`Learning ${index + 1}`}
              />
              {formData.lessons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('lessons', index)}
                  className="remove-field-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('lessons')}
            className="add-field-btn"
          >
            + Add Learning
          </button>
        </div>

        <div className="form-section">
          <h3>Project Image</h3>
          <div className="form-group">
            <label htmlFor="images">Upload Screenshots (Multiple)</label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <small>Upload multiple screenshots or images of your project (optional)</small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Project...' : 'Add Project'}
          </button>
        </div>
    </form>
    </div>
  );
};

export default AddProject;
