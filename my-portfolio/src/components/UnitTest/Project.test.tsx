
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Projects from '../Projects';

// Mock fetch globally
global.fetch = vi.fn();

// Mock the API endpoints
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    projects: '/api/projects'
  }
}));

// Mock SCSS import
vi.mock('../../styles/projects.scss', () => ({}));

const mockProjects = [
  {
    _id: '1',
    title: 'Test Project 1',
    description: 'A test project description',
    longDescription: 'A longer description for the test project',
    technologies: ['React', 'TypeScript'],
    projectURL: 'https://github.com/test/project1',
    demoURL: 'https://demo.test/project1',
    date: '2024-01-01',
    image: null,
    status: 'live' as const,
    completion: 100,
    features: ['Feature 1', 'Feature 2'],
    challenges: ['Challenge 1'],
    lessons: ['Lesson 1']
  }
];

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when fetching projects', () => {
      (fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<Projects />);
      
      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when fetch fails', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(<Projects />);
      
      await waitFor(() => {
        expect(screen.getByText('Network error while fetching projects')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no projects exist', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });
      
      render(<Projects />);
      
      await waitFor(() => {
        expect(screen.getByText('My Projects')).toBeInTheDocument();
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
      });
    });
  });

  describe('Project Display', () => {
    beforeEach(async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProjects)
      });
    });

    it('displays projects correctly', async () => {
      render(<Projects />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument();
        expect(screen.getByText('A test project description')).toBeInTheDocument();
      });
    });

    it('shows project counter', async () => {
      render(<Projects />);
      
      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 1 projects')).toBeInTheDocument();
      });
    });

    it('displays technology tags', async () => {
      render(<Projects />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Functionality', () => {
    beforeEach(async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProjects)
      });
    });

    it('opens modal when project card is clicked', async () => {
      render(<Projects />);
      
      await waitFor(() => {
        const projectCard = screen.getByText('Test Project 1').closest('.project-card');
        fireEvent.click(projectCard!);
        
        expect(screen.getByText('A longer description for the test project')).toBeInTheDocument();
      });
    });

    it('closes modal when close button is clicked', async () => {
      render(<Projects />);
      
      await waitFor(() => {
        const projectCard = screen.getByText('Test Project 1').closest('.project-card');
        fireEvent.click(projectCard!);
        
        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);
        
        expect(screen.queryByText('A longer description for the test project')).not.toBeInTheDocument();
      });
    });
  });
});
