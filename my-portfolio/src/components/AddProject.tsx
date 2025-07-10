import React, { useState } from 'react';
import '../styles/addProject.scss';
import { API_ENDPOINTS } from '../config/api';

interface ProjectFormData {
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  projectURL: string;
  demoURL: string;
  status: 'live' | 'development' | 'completed';
  completion: number;
  features: string[];
  challenges: string[];
  lessons: string[];
  image?: File | null;
}

const AddProject: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    longDescription: '',
    technologies: [],
    projectURL: '',
    demoURL: '',
    status: 'development',
    completion: 0,
    features: [''],
    challenges: [''],
    lessons: [''],
    image: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newTech, setNewTech] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
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

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
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
        if (key === 'image' && value instanceof File) {
          formDataToSend.append('image', value);
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(API_ENDPOINTS.projects, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: 'Project added successfully!' });
        // Reset form
        setFormData({
          title: '',
          description: '',
          longDescription: '',
          technologies: [],
          projectURL: '',
          demoURL: '',
          status: 'development',
          completion: 0,
          features: [''],
          challenges: [''],
          lessons: [''],
          image: null
        });
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
      <div className="form-header">
        <h2>Add New Project</h2>
        <p>Fill out the form below to add a new project to your portfolio</p>
      </div>

      {submitMessage && (
        <div className={`submit-message ${submitMessage.type}`}>
          {submitMessage.text}
        </div>
      )}

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
            <label htmlFor="description">Short Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Brief description of your project"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="longDescription">Detailed Description *</label>
            <textarea
              id="longDescription"
              name="longDescription"
              value={formData.longDescription}
              onChange={handleInputChange}
              required
              placeholder="Comprehensive description of your project"
              rows={5}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Project Details</h3>
          
          <div className="form-row">
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
              <label htmlFor="completion">Completion Percentage</label>
              <input
                type="range"
                id="completion"
                name="completion"
                min="0"
                max="100"
                value={formData.completion}
                onChange={handleInputChange}
              />
              <span className="completion-value">{formData.completion}%</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectURL">GitHub URL</label>
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
              <label htmlFor="demoURL">Live Demo URL</label>
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
        </div>

        <div className="form-section">
          <h3>Technologies Used</h3>
          
          <div className="tech-input-group">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="Add a technology (e.g., React, Node.js)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            />
            <button type="button" onClick={addTechnology} className="add-tech-btn">
              Add
            </button>
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
            <label htmlFor="image">Upload Screenshot</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
            <small>Upload a screenshot or image of your project (optional)</small>
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
