import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { githubService, getLanguageColor, formatDate, formatRepositorySize } from '../services/githubService';
import '../styles/github.scss';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

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

interface RepositoryActivity {
  name: string;
  commits: number;
  lastCommit: string;
  recentActivity: number;
}

const GitHub: React.FC = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_selectedTimeframe, _setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [displayedRepos, setDisplayedRepos] = useState<number>(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [repositoryActivity, setRepositoryActivity] = useState<RepositoryActivity[]>([]);
  const [repositoryCommits, setRepositoryCommits] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        const [reposData, statsData] = await Promise.all([
          githubService.getRepositories(),
          githubService.getGitHubStats()
        ]);

        setRepos(reposData);
        setStats(statsData);

        // Fetch activity data for top repositories only (limit to avoid rate limits)
        const topRepos = reposData.slice(0, 5);
        const activityPromises = topRepos.map(repo => 
          githubService.getRepositoryActivity(repo.name)
        );
        const activityData = await Promise.all(activityPromises);
        setRepositoryActivity(activityData);

        // Fetch commit counts for displayed repositories only (with delay to avoid rate limits)
        const reposToFetch = reposData.slice(0, 6); // Limit to first 6 repos
        const commitMap: { [key: string]: number } = {};
        
        for (const repo of reposToFetch) {
          try {
            const commits = await githubService.getRepositoryCommits(repo.name);
            commitMap[repo.name] = commits.length;
            // Add small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.warn(`Could not fetch commits for ${repo.name}:`, error);
            commitMap[repo.name] = 0;
          }
        }
        setRepositoryCommits(commitMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);



  // Language distribution data
  const languageLabels = Object.keys(stats?.languages || {});
  const languageData = {
    labels: languageLabels,
    datasets: [{
      data: Object.values(stats?.languages || {}),
      backgroundColor: languageLabels.map(lang => getLanguageColor(lang)),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Repository activity data based on commits
  const repoActivityData = {
    labels: repositoryActivity.slice(0, 5).map(repo => repo.name),
    datasets: [{
      label: 'Total Commits',
      data: repositoryActivity.slice(0, 5).map(repo => repo.commits),
      backgroundColor: 'rgba(64, 224, 208, 0.8)',
      borderColor: 'rgba(64, 224, 208, 1)',
      borderWidth: 1
    }, {
      label: 'Recent Activity (30 days)',
      data: repositoryActivity.slice(0, 5).map(repo => repo.recentActivity),
      backgroundColor: 'rgba(255, 107, 107, 0.8)',
      borderColor: 'rgba(255, 107, 107, 1)',
      borderWidth: 1
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
          <h3>Total Repositories</h3>
          <span className="stat-number">{stats?.totalRepos}</span>
        </div>
        <div className="stat-card">
          <h3>Total Stars</h3>
          <span className="stat-number">{stats?.totalStars}</span>
        </div>
        <div className="stat-card">
          <h3>Total Forks</h3>
          <span className="stat-number">{stats?.totalForks}</span>
        </div>
        <div className="stat-card">
          <h3>Total Commits</h3>
          <span className="stat-number">{stats?.totalCommits}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Repository Activity - Unified Component (Moved to top) */}
        <div className="chart-container full-width">
          <h3>Repository Activity (Based on Commits)</h3>
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
                      color: '#ffffff',
                      callback: function(value) {
                        return value + ' commits';
                      }
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



        {/* Language Distribution - Full Width */}
        <div className="chart-container full-width">
          <h3>Language Distribution</h3>
          <div className="language-distribution-layout">
            <div className="chart-wrapper">
              <Doughnut
                data={languageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false // Hide default legend since we'll create custom one
                    }
                  }
                }}
              />
            </div>
            <div className="language-legend">
              <div className="legend-items">
                {languageLabels.map((lang, index) => (
                  <div key={lang} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: getLanguageColor(lang) }}
                    ></div>
                    <span className="legend-label">{lang}</span>
                    <span className="legend-percentage">{stats?.languages[lang]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Recent Repositories */}
      <div className="repositories-section">
        <h3>Recent Repositories</h3>
        <div className="repositories-grid">
          {repos.slice(0, displayedRepos).map((repo) => (
            <div key={repo.id} className="repository-card">
              <div className="repo-header">
                <h4>{repo.name}</h4>
                <span className="repo-language" style={{ color: getLanguageColor(repo.language) }}>
                  {repo.language}
                </span>
              </div>
              <p className="repo-description">{repo.description}</p>
              <div className="repo-stats">
                <span>{repositoryCommits[repo.name] || 0} commits</span>
                <span>{formatDate(repo.updated_at)}</span>
              </div>
              <div className="repo-topics">
                {repo.topics.slice(0, 3).map((topic) => (
                  <span key={topic} className="topic-tag">{topic}</span>
                ))}
              </div>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-link">
                View Repository
              </a>
            </div>
          ))}
        </div>
        
        {hasMoreRepos && (
          <div className="load-more-container">
            <button 
              onClick={handleLoadMore} 
              disabled={loadingMore}
              className="load-more-btn"
            >
              {loadingMore ? 'Loading...' : 'Load More Repositories'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHub;
