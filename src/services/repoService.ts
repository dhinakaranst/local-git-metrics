
import apiRequest from './api';
import githubService from './githubService';

// Types based on API specs
export interface RepoAnalysisRequest {
  repoPath: string;
  isRemoteUrl?: boolean;
}

export interface CommitData {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface FileChangeData {
  filename: string;
  changes: number;
}

export interface RepoAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    commits: CommitData[];
    filesChanged: FileChangeData[];
    languages: Record<string, number>;
    authors: string[];
    commitCountByDate: Record<string, number>;
  };
}

export interface RepoSummary {
  totalCommits: number;
  topFiles: FileChangeData[];
  languages: Record<string, number>;
  authors: string[];
  commitCountByDate: Record<string, number>;
}

export interface CommitsResponse {
  commits: CommitData[];
}

// Store current repo path for other service calls
let currentRepoPath: string = '';

export const repoService = {
  // Analyze a repository - try GitHub API first, fall back to local simulation
  analyzeRepo: async (repoPath: string): Promise<RepoAnalysisResponse> => {
    console.log(`Analyzing repository: ${repoPath}`);
    
    // Check if it's a GitHub URL
    if (!repoPath.includes('github.com')) {
      throw new Error('Only GitHub repositories are supported');
    }

    // Store the current repo path for other service calls
    currentRepoPath = repoPath;
    
    try {
      // Try GitHub API first
      console.log('Attempting GitHub API analysis...');
      const result = await githubService.analyzeRepository(repoPath);
      
      // Save the result to localStorage for caching
      localStorage.setItem('commitMetrics_lastRepo', JSON.stringify({
        path: repoPath,
        data: result.data,
        timestamp: Date.now()
      }));

      console.log('GitHub API analysis successful');
      return result;
    } catch (error) {
      console.error(`GitHub API failed, falling back to local simulation:`, error);
      
      // Fall back to local simulation - this will use the local mock data generator
      console.log('Using local repository simulation...');
      return await apiRequest('/api/repo/analyze', {
        method: 'POST',
        body: JSON.stringify({ repoPath })
      });
    }
  },

  // Get the summary of the current repository
  getRepoSummary: async (repoPath?: string): Promise<RepoSummary> => {
    const pathToUse = repoPath || currentRepoPath;
    
    if (!pathToUse) {
      throw new Error('No repository path available');
    }

    try {
      // Try GitHub API first
      const summary = await githubService.getSummary(pathToUse);
      
      // Ensure authors is properly typed as string[]
      return {
        ...summary,
        authors: summary.authors.filter((author): author is string => typeof author === 'string')
      };
    } catch (error) {
      console.error('GitHub API failed for summary, using cached/local data:', error);
      
      // Use cached data from localStorage
      const saved = localStorage.getItem('commitMetrics_lastRepo');
      if (saved) {
        const { data } = JSON.parse(saved);
        return {
          totalCommits: data.commits.length,
          topFiles: data.filesChanged.slice(0, 5),
          languages: data.languages,
          authors: data.authors,
          commitCountByDate: data.commitCountByDate
        };
      }
      
      throw new Error('No repository data available. Please analyze a repository first.');
    }
  },

  // Get commits filtered by date range and/or author
  getCommits: async (
    startDate?: string,
    endDate?: string,
    author?: string
  ): Promise<CommitsResponse> => {
    if (!currentRepoPath) {
      throw new Error('No repository path available');
    }

    try {
      // Try GitHub API first
      return await githubService.getCommits(currentRepoPath, startDate, endDate, author);
    } catch (error) {
      console.error('GitHub API failed for commits, using cached/local data:', error);
      
      // Use cached data from localStorage
      const saved = localStorage.getItem('commitMetrics_lastRepo');
      if (saved) {
        let commits = JSON.parse(saved).data.commits;
        
        // Apply filters if provided
        if (startDate || endDate || author) {
          commits = commits.filter((commit: CommitData) => {
            let include = true;
            
            if (startDate && commit.date < startDate) include = false;
            if (endDate && commit.date > endDate) include = false;
            if (author && commit.author !== author) include = false;
            
            return include;
          });
        }
        
        return { commits };
      }
      
      throw new Error('No repository data available. Please analyze a repository first.');
    }
  },

  // Get language breakdown for the repo
  getLanguages: async (): Promise<Record<string, number>> => {
    if (!currentRepoPath) {
      throw new Error('No repository path available');
    }

    try {
      // Try GitHub API first
      return await githubService.getLanguages(currentRepoPath);
    } catch (error) {
      console.error('GitHub API failed for languages, using cached/local data:', error);
      
      // Use cached data from localStorage
      const saved = localStorage.getItem('commitMetrics_lastRepo');
      if (saved) {
        return JSON.parse(saved).data.languages;
      }
      
      throw new Error('No repository data available. Please analyze a repository first.');
    }
  },

  // Get top files modified the most
  getTopFiles: async (limit?: number): Promise<FileChangeData[]> => {
    if (!currentRepoPath) {
      throw new Error('No repository path available');
    }

    try {
      // Try GitHub API first
      const summary = await githubService.getSummary(currentRepoPath);
      return summary.topFiles.slice(0, limit || 10);
    } catch (error) {
      console.error('GitHub API failed for top files, using cached/local data:', error);
      
      // Use cached data from localStorage
      const saved = localStorage.getItem('commitMetrics_lastRepo');
      if (saved) {
        return JSON.parse(saved).data.filesChanged.slice(0, limit || 10);
      }
      
      throw new Error('No repository data available. Please analyze a repository first.');
    }
  },

  // Export dashboard as PDF (mock implementation)
  exportAsPdf: async (data: any): Promise<Blob> => {
    // This would need a proper PDF generation service
    return new Blob(['Mock PDF content for real data'], { type: 'application/pdf' });
  }
};

export default repoService;
