
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }: any) => <div data-testid="bar-chart" data-labels={JSON.stringify(data.labels)} />,
  Doughnut: ({ data }: any) => <div data-testid="doughnut-chart" data-labels={JSON.stringify(data.labels)} />,
  Line: ({ data }: any) => <div data-testid="line-chart" data-labels={JSON.stringify(data.labels)} />
}));

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(),
  scaleLinear: vi.fn(),
  scaleBand: vi.fn(),
  axisLeft: vi.fn(),
  axisBottom: vi.fn()
}));

// Mock GitHub service
vi.mock('../../services/githubService', () => ({
  githubService: {
    getRepositories: vi.fn() as any,
    getGitHubStats: vi.fn() as any
  },
  getLanguageColor: vi.fn(() => '#3178c6'),
  formatDate: vi.fn((_date: string) => '2 days ago'),
  formatRepositorySize: vi.fn((_size: number) => '1.2 MB')
}));

// Mock SCSS import
vi.mock('../../styles/github.scss', () => ({}));

// Mock Chart.js registration
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn()
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {},
  PointElement: {},
  LineElement: {},
  Filler: {}
}));

describe('GitHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the GitHub dashboard', async () => {
      // Mock the service to return data
      const { githubService } = await import('../../services/githubService');
      (githubService.getRepositories as any).mockResolvedValue([]);
      (githubService.getGitHubStats as any).mockResolvedValue({
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        totalCommits: 0,
        languages: {},
        contributions: []
      });

      // Import and render the component
      const { default: GitHub } = await import('../GitHub');
      render(<GitHub />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Repositories')).toBeInTheDocument();
        expect(screen.getByText('Total Stars')).toBeInTheDocument();
        expect(screen.getByText('Total Forks')).toBeInTheDocument();
        expect(screen.getByText('Total Commits')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', async () => {
      // Mock the service to never resolve
      const { githubService } = await import('../../services/githubService');
      (githubService.getRepositories as any).mockImplementation(() => new Promise(() => {}));
      (githubService.getGitHubStats as any).mockImplementation(() => new Promise(() => {}));

      const { default: GitHub } = await import('../GitHub');
      render(<GitHub />);
      
      expect(screen.getByText('Loading GitHub data...')).toBeInTheDocument();
    });

    it('shows error message when service fails', async () => {
      // Mock the service to reject
      const { githubService } = await import('../../services/githubService');
      (githubService.getRepositories as any).mockRejectedValue(new Error('API Error'));
      (githubService.getGitHubStats as any).mockRejectedValue(new Error('API Error'));

      const { default: GitHub } = await import('../GitHub');
      render(<GitHub />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load GitHub data/)).toBeInTheDocument();
      });
    });
  });
});
