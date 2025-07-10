
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddProject from '../AddProject';

// Mock fetch globally
global.fetch = vi.fn();

// Mock the API endpoints
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    projects: '/api/projects'
  }
}));

// Mock SCSS import
vi.mock('../../styles/addProject.scss', () => ({}));

describe('AddProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders the form with all sections', () => {
      render(<AddProject />);
      
      expect(screen.getByText('Add New Project')).toBeInTheDocument();
      expect(screen.getByText('Fill out the form below to add a new project to your portfolio')).toBeInTheDocument();
      
      // Check form sections
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Project Details')).toBeInTheDocument();
      expect(screen.getByText('Technologies Used')).toBeInTheDocument();
      expect(screen.getByText('Project Features')).toBeInTheDocument();
      expect(screen.getByText('Challenges Faced')).toBeInTheDocument();
      expect(screen.getByText('Key Learnings')).toBeInTheDocument();
      expect(screen.getByText('Project Image')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<AddProject />);
      
      expect(screen.getByLabelText('Project Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Description *')).toBeInTheDocument();
      expect(screen.getByLabelText('Detailed Description *')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Status *')).toBeInTheDocument();
      expect(screen.getByLabelText('Completion Percentage')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Live Demo URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload Screenshot')).toBeInTheDocument();
    });

    it('shows submit button', () => {
      render(<AddProject />);
      
      expect(screen.getByRole('button', { name: 'Add Project' })).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('updates form fields when user types', () => {
      render(<AddProject />);
      
      const titleInput = screen.getByLabelText('Project Title *');
      const descriptionInput = screen.getByLabelText('Short Description *');
      
      fireEvent.change(titleInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'A test project' } });
      
      expect(titleInput).toHaveValue('Test Project');
      expect(descriptionInput).toHaveValue('A test project');
    });

    it('updates completion percentage slider', () => {
      render(<AddProject />);
      
      const completionSlider = screen.getByLabelText('Completion Percentage');
      fireEvent.change(completionSlider, { target: { value: '75' } });
      
      expect(completionSlider).toHaveValue('75');
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('updates project status selection', () => {
      render(<AddProject />);
      
      const statusSelect = screen.getByLabelText('Project Status *');
      fireEvent.change(statusSelect, { target: { value: 'live' } });
      
      expect(statusSelect).toHaveValue('live');
    });
  });

  describe('Technology Management', () => {
    it('adds technology when Add button is clicked', () => {
      render(<AddProject />);
      
      const techInput = screen.getByPlaceholderText('Add a technology (e.g., React, Node.js)');
      const addButton = screen.getByRole('button', { name: 'Add' });
      
      fireEvent.change(techInput, { target: { value: 'React' } });
      fireEvent.click(addButton);
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(techInput).toHaveValue('');
    });

    it('adds technology when Enter key is pressed', () => {
      render(<AddProject />);
      
      const techInput = screen.getByPlaceholderText('Add a technology (e.g., React, Node.js)');
      
      fireEvent.change(techInput, { target: { value: 'TypeScript' } });
      fireEvent.keyPress(techInput, { key: 'Enter', code: 'Enter' });
      
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('does not add duplicate technologies', () => {
      render(<AddProject />);
      
      const techInput = screen.getByPlaceholderText('Add a technology (e.g., React, Node.js)');
      const addButton = screen.getByRole('button', { name: 'Add' });
      
      // Add React twice
      fireEvent.change(techInput, { target: { value: 'React' } });
      fireEvent.click(addButton);
      fireEvent.change(techInput, { target: { value: 'React' } });
      fireEvent.click(addButton);
      
      const reactTags = screen.getAllByText('React');
      expect(reactTags).toHaveLength(1);
    });

    it('removes technology when remove button is clicked', () => {
      render(<AddProject />);
      
      const techInput = screen.getByPlaceholderText('Add a technology (e.g., React, Node.js)');
      const addButton = screen.getByRole('button', { name: 'Add' });
      
      fireEvent.change(techInput, { target: { value: 'React' } });
      fireEvent.click(addButton);
      
      expect(screen.getByText('React')).toBeInTheDocument();
      
      const removeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(removeButton);
      
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    it('does not add empty technology', () => {
      render(<AddProject />);
      
      const techInput = screen.getByPlaceholderText('Add a technology (e.g., React, Node.js)');
      const addButton = screen.getByRole('button', { name: 'Add' });
      
      fireEvent.change(techInput, { target: { value: '   ' } });
      fireEvent.click(addButton);
      
      expect(screen.queryByText('   ')).not.toBeInTheDocument();
    });
  });

  describe('Array Fields Management', () => {
    it('adds new feature field', () => {
      render(<AddProject />);
      
      const addFeatureButton = screen.getByRole('button', { name: '+ Add Feature' });
      fireEvent.click(addFeatureButton);
      
      const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/);
      expect(featureInputs).toHaveLength(2);
    });

    it('adds new challenge field', () => {
      render(<AddProject />);
      
      const addChallengeButton = screen.getByRole('button', { name: '+ Add Challenge' });
      fireEvent.click(addChallengeButton);
      
      const challengeInputs = screen.getAllByPlaceholderText(/Challenge \d+/);
      expect(challengeInputs).toHaveLength(2);
    });

    it('adds new learning field', () => {
      render(<AddProject />);
      
      const addLearningButton = screen.getByRole('button', { name: '+ Add Learning' });
      fireEvent.click(addLearningButton);
      
      const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/);
      expect(learningInputs).toHaveLength(2);
    });

    it('removes array field when remove button is clicked', () => {
      render(<AddProject />);
      
      const addFeatureButton = screen.getByRole('button', { name: '+ Add Feature' });
      fireEvent.click(addFeatureButton);
      
      let featureInputs = screen.getAllByPlaceholderText(/Feature \d+/);
      expect(featureInputs).toHaveLength(2);
      
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
      fireEvent.click(removeButtons[0]);
      
      featureInputs = screen.getAllByPlaceholderText(/Feature \d+/);
      expect(featureInputs).toHaveLength(1);
    });

    it('updates array field values', () => {
      render(<AddProject />);
      
      const featureInput = screen.getByPlaceholderText('Feature 1');
      fireEvent.change(featureInput, { target: { value: 'User Authentication' } });
      
      expect(featureInput).toHaveValue('User Authentication');
    });

    it('does not show remove button for single field', () => {
      render(<AddProject />);
      
      const removeButtons = screen.queryAllByRole('button', { name: 'Remove' });
      expect(removeButtons).toHaveLength(0);
    });
  });

  describe('File Upload', () => {
    it('handles file selection', () => {
      render(<AddProject />);
      
      const fileInput = screen.getByLabelText('Upload Screenshot') as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(fileInput.files?.[0]).toBe(file);
    });

    it('accepts only image files', () => {
      render(<AddProject />);
      
      const fileInput = screen.getByLabelText('Upload Screenshot');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Project added successfully' })
      });
      
      render(<AddProject />);
      
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Project Title *'), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText('Short Description *'), { target: { value: 'A test project' } });
      fireEvent.change(screen.getByLabelText('Detailed Description *'), { target: { value: 'A detailed description' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add Project' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Project added successfully!')).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      (fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<AddProject />);
      
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Project Title *'), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText('Short Description *'), { target: { value: 'A test project' } });
      fireEvent.change(screen.getByLabelText('Detailed Description *'), { target: { value: 'A detailed description' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add Project' });
      fireEvent.click(submitButton);
      
      expect(screen.getByRole('button', { name: 'Adding Project...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Adding Project...' })).toBeDisabled();
    });

    it('shows error message on submission failure', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Validation failed' })
      });
      
      render(<AddProject />);
      
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Project Title *'), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText('Short Description *'), { target: { value: 'A test project' } });
      fireEvent.change(screen.getByLabelText('Detailed Description *'), { target: { value: 'A detailed description' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add Project' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument();
      });
    });

    it('shows network error message on fetch failure', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(<AddProject />);
      
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Project Title *'), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText('Short Description *'), { target: { value: 'A test project' } });
      fireEvent.change(screen.getByLabelText('Detailed Description *'), { target: { value: 'A detailed description' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add Project' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
      });
    });

    it('resets form after successful submission', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Project added successfully' })
      });
      
      render(<AddProject />);
      
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Project Title *'), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText('Short Description *'), { target: { value: 'A test project' } });
      fireEvent.change(screen.getByLabelText('Detailed Description *'), { target: { value: 'A detailed description' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add Project' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Project Title *')).toHaveValue('');
        expect(screen.getByLabelText('Short Description *')).toHaveValue('');
        expect(screen.getByLabelText('Detailed Description *')).toHaveValue('');
      });
    });
  });

  describe('Form Validation', () => {
    it('requires title field', () => {
      render(<AddProject />);
      
      const titleInput = screen.getByLabelText('Project Title *');
      expect(titleInput).toBeRequired();
    });

    it('requires description field', () => {
      render(<AddProject />);
      
      const descriptionInput = screen.getByLabelText('Short Description *');
      expect(descriptionInput).toBeRequired();
    });

    it('requires long description field', () => {
      render(<AddProject />);
      
      const longDescriptionInput = screen.getByLabelText('Detailed Description *');
      expect(longDescriptionInput).toBeRequired();
    });

    it('requires status field', () => {
      render(<AddProject />);
      
      const statusInput = screen.getByLabelText('Project Status *');
      expect(statusInput).toBeRequired();
    });

    it('validates URL format for project URL', () => {
      render(<AddProject />);
      
      const projectURLInput = screen.getByLabelText('GitHub URL');
      expect(projectURLInput).toHaveAttribute('type', 'url');
    });

    it('validates URL format for demo URL', () => {
      render(<AddProject />);
      
      const demoURLInput = screen.getByLabelText('Live Demo URL');
      expect(demoURLInput).toHaveAttribute('type', 'url');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<AddProject />);
      
      expect(screen.getByLabelText('Project Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Description *')).toBeInTheDocument();
      expect(screen.getByLabelText('Detailed Description *')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Status *')).toBeInTheDocument();
      expect(screen.getByLabelText('Completion Percentage')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Live Demo URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload Screenshot')).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<AddProject />);
      
      expect(screen.getByRole('button', { name: 'Add Project' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '+ Add Feature' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '+ Add Challenge' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '+ Add Learning' })).toBeInTheDocument();
    });

    it('has proper placeholders', () => {
      render(<AddProject />);
      
      expect(screen.getByPlaceholderText('Enter project title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Brief description of your project')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Comprehensive description of your project')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://github.com/username/project')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://your-demo-site.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Add a technology (e.g., React, Node.js)')).toBeInTheDocument();
    });
  });
});
