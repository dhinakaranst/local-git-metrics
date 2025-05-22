
import apiRequest from './api';

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

export const repoService = {
  // Analyze a repository from its path or URL
  analyzeRepo: async (repoPath: string): Promise<RepoAnalysisResponse> => {
    // Check if the path is a URL
    const isRemoteUrl = repoPath.startsWith('http://') || repoPath.startsWith('https://');
    
    // Extract repo name for better error handling
    let repoName = "repository";
    if (isRemoteUrl) {
      try {
        const url = new URL(repoPath);
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          repoName = `${pathParts[0]}/${pathParts[1]}`;
        }
      } catch (e) {
        // URL parsing failed, use default
      }
    }

    try {
      console.log(`Analyzing repo: ${repoPath}`);
      return await apiRequest('/api/repo/analyze', {
        method: 'POST',
        body: JSON.stringify({ repoPath, isRemoteUrl }),
      });
    } catch (error) {
      console.error(`Error analyzing ${repoName}:`, error);
      throw error;
    }
  },

  // Get the summary of the last analyzed repo
  getRepoSummary: (repoId?: string): Promise<RepoSummary> => {
    const queryParams = repoId ? `?repoId=${repoId}` : '';
    return apiRequest(`/api/repo/summary${queryParams}`);
  },

  // Get commits filtered by date range and/or author
  getCommits: (
    startDate?: string,
    endDate?: string,
    author?: string
  ): Promise<CommitsResponse> => {
    let queryParams = '';
    
    if (startDate) {
      queryParams += `${queryParams ? '&' : '?'}startDate=${startDate}`;
    }
    
    if (endDate) {
      queryParams += `${queryParams ? '&' : '?'}endDate=${endDate}`;
    }
    
    if (author) {
      queryParams += `${queryParams ? '&' : '?'}author=${encodeURIComponent(author)}`;
    }
    
    return apiRequest(`/api/repo/commits${queryParams}`);
  },

  // Get language breakdown for the repo
  getLanguages: (): Promise<Record<string, number>> => {
    return apiRequest('/api/repo/languages');
  },

  // Get top files modified the most
  getTopFiles: (limit?: number): Promise<FileChangeData[]> => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiRequest(`/api/repo/top-files${queryParams}`);
  },

  // Export dashboard as PDF
  exportAsPdf: (data: any): Promise<Blob> => {
    return apiRequest('/api/export/pdf', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export default repoService;
