
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
  // Analyze a repository - try GitHub API first, fall back to mock data
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
      const result = await githubService.analyzeRepository(repoPath);
      
      // Save the result to localStorage for caching
      localStorage.setItem('commitMetrics_lastRepo', JSON.stringify({
        path: repoPath,
        data: result.data,
        timestamp: Date.now()
      }));

      return result;
    } catch (error) {
      console.error(`GitHub API failed, falling back to mock data:`, error);
      
      // Fall back to mock data simulation
      try {
        return await apiRequest('/api/repo/analyze', {
          method: 'POST',
          body: JSON.stringify({ repoPath })
        });
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error('Unable to analyze repository. Please try again later.');
      }
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
      console.error('GitHub API failed for summary, falling back to cached data:', error);
      
      // Fall back to cached/mock data
      try {
        return await apiRequest('/api/repo/summary');
      } catch (fallbackError) {
        console.error('Fallback summary failed:', fallbackError);
        throw new Error('Unable to get repository summary. Please analyze a repository first.');
      }
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
      console.error('GitHub API failed for commits, falling back to cached data:', error);
      
      // Fall back to cached/mock data
      try {
        let endpoint = '/api/repo/commits';
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (author) params.append('author', author);
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
        
        return await apiRequest(endpoint);
      } catch (fallbackError) {
        console.error('Fallback commits failed:', fallbackError);
        throw new Error('Unable to get commits. Please analyze a repository first.');
      }
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
      console.error('GitHub API failed for languages, falling back to cached data:', error);
      
      // Fall back to cached/mock data
      try {
        return await apiRequest('/api/repo/languages');
      } catch (fallbackError) {
        console.error('Fallback languages failed:', fallbackError);
        throw new Error('Unable to get languages. Please analyze a repository first.');
      }
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
      console.error('GitHub API failed for top files, falling back to cached data:', error);
      
      // Fall back to cached/mock data
      try {
        const endpoint = limit ? `/api/repo/top-files?limit=${limit}` : '/api/repo/top-files';
        return await apiRequest(endpoint);
      } catch (fallbackError) {
        console.error('Fallback top files failed:', fallbackError);
        throw new Error('Unable to get top files. Please analyze a repository first.');
      }
    }
  },

  // Export dashboard as PDF (mock implementation)
  exportAsPdf: async (data: any): Promise<Blob> => {
    // This would need a proper PDF generation service
    return new Blob(['Mock PDF content for real data'], { type: 'application/pdf' });
  }
};

export default repoService;
