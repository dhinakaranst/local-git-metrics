
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
  // Analyze a repository using GitHub API
  analyzeRepo: async (repoPath: string): Promise<RepoAnalysisResponse> => {
    console.log(`Analyzing repository: ${repoPath}`);
    
    // Check if it's a GitHub URL
    if (!repoPath.includes('github.com')) {
      throw new Error('Only GitHub repositories are supported');
    }

    try {
      // Store the current repo path for other service calls
      currentRepoPath = repoPath;
      
      // Use GitHub API for real analysis
      const result = await githubService.analyzeRepository(repoPath);
      
      // Save the result to localStorage for caching
      localStorage.setItem('commitMetrics_lastRepo', JSON.stringify({
        path: repoPath,
        data: result.data,
        timestamp: Date.now()
      }));

      return result;
    } catch (error) {
      console.error(`Error analyzing repository:`, error);
      throw error;
    }
  },

  // Get the summary of the current repository
  getRepoSummary: async (repoPath?: string): Promise<RepoSummary> => {
    const pathToUse = repoPath || currentRepoPath;
    
    if (!pathToUse) {
      throw new Error('No repository path available');
    }

    try {
      const summary = await githubService.getSummary(pathToUse);
      
      // Ensure authors is properly typed as string[]
      return {
        ...summary,
        authors: summary.authors.filter((author): author is string => typeof author === 'string')
      };
    } catch (error) {
      console.error('Error getting repo summary:', error);
      throw error;
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
      return await githubService.getCommits(currentRepoPath, startDate, endDate, author);
    } catch (error) {
      console.error('Error getting commits:', error);
      throw error;
    }
  },

  // Get language breakdown for the repo
  getLanguages: async (): Promise<Record<string, number>> => {
    if (!currentRepoPath) {
      throw new Error('No repository path available');
    }

    try {
      return await githubService.getLanguages(currentRepoPath);
    } catch (error) {
      console.error('Error getting languages:', error);
      throw error;
    }
  },

  // Get top files modified the most
  getTopFiles: async (limit?: number): Promise<FileChangeData[]> => {
    if (!currentRepoPath) {
      throw new Error('No repository path available');
    }

    try {
      const summary = await githubService.getSummary(currentRepoPath);
      return summary.topFiles.slice(0, limit || 10);
    } catch (error) {
      console.error('Error getting top files:', error);
      throw error;
    }
  },

  // Export dashboard as PDF (mock implementation)
  exportAsPdf: async (data: any): Promise<Blob> => {
    // This would need a proper PDF generation service
    return new Blob(['Mock PDF content for real data'], { type: 'application/pdf' });
  }
};

export default repoService;
