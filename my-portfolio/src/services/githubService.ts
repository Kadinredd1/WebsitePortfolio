// GitHub API Service
// Note: For production use, you'll need to set up GitHub OAuth or use a Personal Access Token

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || 'Kadinredd1';

export interface Repository {
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
  fork: boolean;
  created_at: string;
  pushed_at: string;
}

export interface ContributionData {
  date: string;
  count: number;
}

export interface LanguageStats {
  [key: string]: number;
}

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  languages: LanguageStats;
  contributions: ContributionData[];
  userInfo: {
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
  };
}

class GitHubService {
  private token: string | null = null;

  constructor() {
    // In production, get token from environment variables or secure storage
    this.token = import.meta.env.VITE_GITHUB_TOKEN || null;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Fetch user repositories
  async getRepositories(): Promise<Repository[]> {
    try {
      const repos = await this.makeRequest(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
      
      // Filter out forked repositories if desired
      const filteredRepos = repos.filter((repo: Repository) => !repo.fork);
      
      return filteredRepos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description available',
        language: repo.language || 'Unknown',
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
        size: repo.size,
        topics: repo.topics || [],
        private: repo.private,
        fork: repo.fork,
        created_at: repo.created_at,
        pushed_at: repo.pushed_at
      }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  // Fetch user information
  async getUserInfo(): Promise<any> {
    try {
      return await this.makeRequest(`/users/${GITHUB_USERNAME}`);
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  // Calculate language statistics from repositories with detailed language breakdown
  async calculateLanguageStats(repos: Repository[]): Promise<LanguageStats> {
    const languageStats: LanguageStats = {};
    let totalBytes = 0;

    try {
      // Fetch detailed language breakdown for each repository
      const languagePromises = repos.map(repo => 
        this.getRepositoryLanguages(repo.name).catch(() => ({}))
      );
      const languageResults = await Promise.all(languagePromises);

      // Aggregate language data from all repositories
      languageResults.forEach((repoLanguages: any) => {
        Object.entries(repoLanguages).forEach(([language, bytes]) => {
          const byteCount = bytes as number;
          languageStats[language] = (languageStats[language] || 0) + byteCount;
          totalBytes += byteCount;
        });
      });

      // Convert to percentages
      if (totalBytes > 0) {
        Object.keys(languageStats).forEach(lang => {
          languageStats[lang] = Math.round((languageStats[lang] / totalBytes) * 100);
        });
      }
    } catch (error) {
      console.warn('Could not fetch detailed language data, falling back to primary languages:', error);
      
      // Fallback to primary language method
      repos.forEach(repo => {
        if (repo.language && repo.language !== 'Unknown') {
          const size = repo.size || 0;
          languageStats[repo.language] = (languageStats[repo.language] || 0) + size;
          totalBytes += size;
        }
      });

      // Convert to percentages
      if (totalBytes > 0) {
        Object.keys(languageStats).forEach(lang => {
          languageStats[lang] = Math.round((languageStats[lang] / totalBytes) * 100);
        });
      }
    }

    return languageStats;
  }

  // Generate contribution data (placeholder - would need GraphQL API for real data)
  generateContributions(): ContributionData[] {
    const contributions: ContributionData[] = [];
    const today = new Date();
    
    // Use a seed based on the current month to make data consistent
    const seed = today.getFullYear() * 100 + today.getMonth();
    
    // Generate 30 days of contribution data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Use a simple hash to generate consistent "random" data
      const dateString = date.toISOString().split('T')[0];
      const hash = dateString.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, seed);
      
      contributions.push({
        date: dateString,
        count: Math.abs(hash) % 6 // Consistent 0-5 range
      });
    }

    return contributions;
  }

  // Fetch comprehensive GitHub statistics
  async getGitHubStats(): Promise<GitHubStats> {
    try {
      const [repos, userInfo] = await Promise.all([
        this.getRepositories(),
        this.getUserInfo()
      ]);

      const languages = await this.calculateLanguageStats(repos);
      const contributions = this.generateContributions();

      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

      // Calculate total commits from recent repositories
      let totalCommits = 0;
      try {
        const recentRepos = repos.slice(0, 5); // Get commits from top 5 repos
        const commitPromises = recentRepos.map(repo => 
          this.getRepositoryCommits(repo.name).catch(() => [])
        );
        const commitResults = await Promise.all(commitPromises);
        totalCommits = commitResults.reduce((sum, commits) => sum + commits.length, 0);
        
      } catch (error) {
        console.warn('Could not fetch commit data:', error);
        totalCommits = 0;
      }

      return {
        totalRepos: repos.length,
        totalStars,
        totalForks,
        totalCommits,
        languages,
        contributions,
        userInfo: {
          login: userInfo.login,
          name: userInfo.name || userInfo.login,
          avatar_url: userInfo.avatar_url,
          bio: userInfo.bio || '',
          public_repos: userInfo.public_repos,
          followers: userInfo.followers,
          following: userInfo.following
        }
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      throw error;
    }
  }

  // Get repository details with additional info
  async getRepositoryDetails(repoName: string): Promise<any> {
    try {
      return await this.makeRequest(`/repos/${GITHUB_USERNAME}/${repoName}`);
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw error;
    }
  }

  // Get repository commits
  async getRepositoryCommits(repoName: string): Promise<any[]> {
    try {
      return await this.makeRequest(`/repos/${GITHUB_USERNAME}/${repoName}/commits?per_page=100`);
    } catch (error) {
      console.error('Error fetching repository commits:', error);
      throw error;
    }
  }

  // Get repository languages
  async getRepositoryLanguages(repoName: string): Promise<any> {
    try {
      return await this.makeRequest(`/repos/${GITHUB_USERNAME}/${repoName}/languages`);
    } catch (error) {
      console.error('Error fetching repository languages:', error);
      throw error;
    }
  }

  // Get repository activity data (commits, recent activity)
  async getRepositoryActivity(repoName: string): Promise<{
    name: string;
    commits: number;
    lastCommit: string;
    recentActivity: number;
  }> {
    try {
      const commits = await this.getRepositoryCommits(repoName);
      const lastCommit = commits.length > 0 ? commits[0].commit.author.date : '';
      
      // Calculate recent activity (commits in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = commits.filter((commit: any) => {
        const commitDate = new Date(commit.commit.author.date);
        return commitDate > thirtyDaysAgo;
      }).length;

      return {
        name: repoName,
        commits: commits.length,
        lastCommit,
        recentActivity
      };
    } catch (error) {
      console.error(`Error fetching activity for ${repoName}:`, error);
      return {
        name: repoName,
        commits: 0,
        lastCommit: '',
        recentActivity: 0
      };
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();

// Helper function to get language colors
export const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    // Popular languages with distinct colors
    'TypeScript': '#2b7489',
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00add8',
    'Rust': '#dea584',
    'Ruby': '#701516',
    'PHP': '#4f5d95',
    'Swift': '#ffac45',
    'Kotlin': '#f18e33',
    'Scala': '#c22d40',
    'R': '#198ce7',
    'MATLAB': '#e16737',
    'Shell': '#89e051',
    'PowerShell': '#012456',
    
    // Frontend frameworks
    'Vue': '#4fc08d',
    'React': '#61dafb',
    'Angular': '#dd0031',
    'Svelte': '#ff3e00',
    'Next.js': '#000000',
    'Nuxt.js': '#00c58e',
    
    // Backend and other languages
    'Dart': '#00b4ab',
    'Elixir': '#6e4a7e',
    'Clojure': '#db5855',
    'Haskell': '#5d4f85',
    'OCaml': '#3be133',
    'F#': '#b845fc',
    'C#': '#178600',
    'Objective-C': '#438eff',
    'Assembly': '#6e4c13',
    'COBOL': '#ff6b6b',
    'Fortran': '#4d41b1',
    'Lisp': '#3fb68b',
    'Prolog': '#74283c',
    'Erlang': '#b83998',
    'Lua': '#000080',
    'Perl': '#39457e',
    'Groovy': '#e69f56',
    'D': '#ba595e',
    'Nim': '#ffc200',
    'Crystal': '#776791',
    'Zig': '#ec915c',
    'V': '#4f87c4',
    'Carbon': '#8f4e8b',
    'Mojo': '#ff4c1f',
    
    // Additional modern languages
    'Solidity': '#363636',
    'WebAssembly': '#654ff0',
    'Julia': '#a270ba',
    'Ballerina': '#ff5000',
    'Pony': '#e2c4a9',
    'Vale': '#de3d83',
    'Haxe': '#df7900',
    
    // Markup and config languages
    'Markdown': '#083fa1',
    'YAML': '#cb171e',
    'JSON': '#000000',
    'XML': '#f0f0f0',
    'TOML': '#9c4121',
    'INI': '#d1dbe0',
    
    // Build tools and package managers
    'Makefile': '#427819',
    'Dockerfile': '#384d54',
    'CMake': '#064f8c',
    'Maven': '#c71a36',
    'Gradle': '#02303a',
    'npm': '#cb3837',
    'yarn': '#2c8ebb'
  };
  
  return colors[language] || '#6b7280';
};

// Helper function to format repository size
export const formatRepositorySize = (size: number): string => {
  if (size < 1024) {
    return `${size} KB`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} MB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} GB`;
  }
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Handle timezone differences by using UTC
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  
  const diffTime = Math.abs(utcNow.getTime() - utcDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

  if (diffHours < 24) {
    if (diffHours < 1) {
      return 'just now';
    } else if (diffHours === 1) {
      return '1 hour ago';
    } else {
      return `${diffHours} hours ago`;
    }
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}; 