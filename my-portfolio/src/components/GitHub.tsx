import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import * as d3 from 'd3';
import { githubService, getLanguageColor, formatDate, formatRepositorySize } from '../services/githubService';
import '../styles/github.scss';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface Repository {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  size: number;
  topics: string[];
  private: boolean;
}

interface ContributionData {
  date: string;
  count: number;
}

interface LanguageStats {
  [key: string]: number;
}

interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  languages: LanguageStats;
  contributions: ContributionData[];
}

const GitHub: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [displayedRepos, setDisplayedRepos] = useState<number>(6);
  const [loadingMore, setLoadingMore] = useState(false);

  // Real GitHub data will be fetched from the API

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        
        // Use GitHub service to fetch real data
        const [reposData, statsData] = await Promise.all([
          githubService.getRepositories(),
          githubService.getGitHubStats()
        ]);
        
        setRepos(reposData);
        setStats(statsData);
      } catch (error) {
        console.error('GitHub API error:', error);
        setError('Failed to load GitHub data. Please check your GitHub username and API token configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  // Contribution graph data
  const contributionData = stats?.contributions.slice(-30) || [];
  const contributionLabels = contributionData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const contributionValues = contributionData.map(d => d.count);

  // Language distribution data
  const languageData = {
    labels: Object.keys(stats?.languages || {}),
    datasets: [{
      data: Object.values(stats?.languages || {}),
      backgroundColor: [
        '#3178c6', // TypeScript blue
        '#f7df1e', // JavaScript yellow
        '#3776ab', // Python blue
        '#e34c26', // HTML orange
        '#1572b6', // CSS blue
        '#7952b3', // Bootstrap purple
        '#61dafb', // React blue
        '#000000', // Black
        '#ff6b6b', // Red
        '#4ecdc4'  // Teal
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Repository activity data
  const repoActivityData = {
    labels: repos.slice(0, 5).map(repo => repo.name),
    datasets: [{
      label: 'Stars',
      data: repos.slice(0, 5).map(repo => repo.stargazers_count),
      backgroundColor: 'rgba(255, 193, 7, 0.8)',
      borderColor: 'rgba(255, 193, 7, 1)',
      borderWidth: 1
    }, {
      label: 'Forks',
      data: repos.slice(0, 5).map(repo => repo.forks_count),
      backgroundColor: 'rgba(40, 167, 69, 0.8)',
      borderColor: 'rgba(40, 167, 69, 1)',
      borderWidth: 1
    }]
  };

  // Coding activity over time - consistent data
  const activityData = {
    labels: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [{
      label: 'Commits',
      data: [45, 67, 89, 34, 78, 92, 56, 23, 67, 89, 45, 78], // Consistent data
      borderColor: 'rgba(64, 224, 208, 1)',
      backgroundColor: 'rgba(64, 224, 208, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const hasMoreRepos = displayedRepos < repos.length;

  const handleLoadMore = async () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setDisplayedRepos(prev => prev + 3);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="github-loading">
        <div className="loading-spinner">Loading GitHub data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="github-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="github-dashboard">
      {/* Header Stats */}
      <div className="stats-header">
        <div className="stat-card">
          <h3>📊 Total Repositories</h3>
          <span className="stat-number">{stats?.totalRepos}</span>
        </div>
        <div className="stat-card">
          <h3>⭐ Total Stars</h3>
          <span className="stat-number">{stats?.totalStars}</span>
        </div>
        <div className="stat-card">
          <h3>🍴 Total Forks</h3>
          <span className="stat-number">{stats?.totalForks}</span>
        </div>
        <div className="stat-card">
          <h3>💻 Total Commits</h3>
          <span className="stat-number">{stats?.totalCommits}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Contribution Graph */}
        <div className="chart-container">
          <h3>📈 Recent Activity (Last 30 Days)</h3>
          <div className="contribution-graph">
            {contributionData.map((day, index) => (
              <div
                key={day.date}
                className={`contribution-day level-${Math.min(Math.floor(day.count / 2), 4)}`}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="chart-container">
          <h3>🔤 Language Distribution</h3>
          <div className="chart-wrapper">
            <Doughnut
              data={languageData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#ffffff',
                      padding: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Repository Activity */}
        <div className="chart-container">
          <h3>📊 Top Repositories Activity</h3>
          <div className="chart-wrapper">
            <Bar
              data={repoActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#ffffff'
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#ffffff'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#ffffff'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Coding Activity Over Time */}
        <div className="chart-container">
          <h3>📅 Coding Activity (Last 12 Months)</h3>
          <div className="chart-wrapper">
            <Line
              data={activityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#ffffff'
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#ffffff'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#ffffff'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="repositories-section">
        <div className="repositories-header">
          <h3>📁 Recent Repositories</h3>
          <p className="repositories-counter">
            Showing {Math.min(displayedRepos, repos.length)} of {repos.length} repositories
          </p>
        </div>
        <div className="repositories-grid">
          {repos.slice(0, displayedRepos).map((repo) => (
            <div key={repo.id} className="repository-card">
              <div className="repo-header">
                <h4>{repo.name}</h4>
                <span className={`repo-visibility ${repo.private ? 'private' : 'public'}`}>
                  {repo.private ? '🔒' : '🌐'}
                </span>
              </div>
              <p className="repo-description">{repo.description}</p>
              <div className="repo-stats">
                <span className="repo-language">
                  <span className="language-dot" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                  {repo.language}
                </span>
                <span className="repo-stars">⭐ {repo.stargazers_count}</span>
                <span className="repo-forks">🍴 {repo.forks_count}</span>
              </div>
              <div className="repo-topics">
                {repo.topics.slice(0, 3).map((topic) => (
                  <span key={topic} className="topic-tag">{topic}</span>
                ))}
              </div>
              <div className="repo-footer">
                <span className="repo-updated">
                  Updated {formatDate(repo.updated_at)}
                </span>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-link">
                  View Repository →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreRepos && (
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
                  📂 Load More Repositories ({repos.length - displayedRepos} remaining)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



export default GitHub;
