
// Base API configuration
const API_BASE_URL = 'https://commit-metrics-api.onrender.com';

// Function to get current API URL
export const getCurrentApiUrl = () => API_BASE_URL;

// Check if network is online
const checkOnlineStatus = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for making API requests with retry capability
const apiRequest = async (endpoint: string, options: RequestInit = {}, retries = 3) => {
  try {
    // Check if network is online before making request
    if (!checkOnlineStatus()) {
      throw new Error('Network connection issue. Please check your internet connection and try again.');
    }

    // Check if using local simulation mode
    if (endpoint.includes('/api/repo/analyze')) {
      console.log('Using local repository analysis simulation');
      return localAnalyzeRepo(options.body ? JSON.parse(options.body as string) : {});
    }

    // For other endpoints, attempt to use the original API
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}. Please try again.`);
      }

      // Handle PDF responses
      if (response.headers.get('Content-Type')?.includes('application/pdf')) {
        return response.blob();
      }

      return response.json();
    } catch (error) {
      // If it's a server API endpoint, fall back to local simulation
      if (endpoint.includes('/api/repo') && retries === 0) {
        console.log('API server unreachable, falling back to local simulation');
        return handleLocalEndpoint(endpoint, options);
      }

      // If we have retries left and it's a network error, retry the request
      if (retries > 0 && (error instanceof TypeError || error instanceof DOMException)) {
        console.log(`Retry attempt ${4 - retries} for ${endpoint}`);
        // Wait before retrying (exponential backoff)
        await delay(1000 * (4 - retries));
        return apiRequest(endpoint, options, retries - 1);
      }
      throw error;
    }
  } catch (error) {
    console.error('API request error:', error);
    
    // If it's an API endpoint, try local simulation
    if (endpoint.includes('/api/repo')) {
      console.log('Falling back to local simulation due to error');
      return handleLocalEndpoint(endpoint, options);
    }
    
    if (error instanceof TypeError || error instanceof DOMException) {
      throw new Error('Unable to connect to the analysis server. Please try again later.');
    }
    
    throw error;
  }
};

// Handle local endpoints for different API routes
const handleLocalEndpoint = (endpoint: string, options: RequestInit = {}) => {
  if (endpoint.includes('/api/repo/analyze')) {
    return localAnalyzeRepo(options.body ? JSON.parse(options.body as string) : {});
  }
  
  if (endpoint.includes('/api/repo/summary')) {
    return getSavedRepoSummary();
  }
  
  if (endpoint.includes('/api/repo/commits')) {
    return getSavedCommits();
  }
  
  if (endpoint.includes('/api/repo/languages')) {
    return getSavedLanguages();
  }
  
  if (endpoint.includes('/api/repo/top-files')) {
    return getSavedTopFiles();
  }

  if (endpoint.includes('/api/export/pdf')) {
    return new Blob(['Mock PDF content'], { type: 'application/pdf' });
  }

  throw new Error(`Endpoint ${endpoint} not supported in local mode`);
};

// Local repository analysis that creates mock data
const localAnalyzeRepo = async (data: { repoPath: string }) => {
  // Simulate API delay
  await delay(2000);
  
  const { repoPath } = data;

  // Extract repository name from URL
  let repoName = "unknown";
  try {
    const url = new URL(repoPath);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      repoName = pathParts[1];
    }
  } catch (e) {
    console.error("Error parsing repo URL:", e);
  }

  // Generate mock analysis data based on repository URL
  const mockData = generateMockData(repoPath, repoName);
  
  // Save generated data to localStorage for other endpoints
  localStorage.setItem('commitMetrics_lastRepo', JSON.stringify({
    path: repoPath,
    data: mockData,
    timestamp: Date.now()
  }));

  return {
    success: true,
    message: `Repository ${repoName} analyzed successfully`,
    data: mockData
  };
};

// Generate realistic mock data for a repository
function generateMockData(repoPath: string, repoName: string) {
  // Generate mock commits (past 30 days)
  const commits = generateMockCommits(repoPath, 30);
  
  // Extract commit dates for date-based stats
  const commitDates = commits.map(commit => commit.date.split('T')[0]);
  const commitCountByDate = commitDates.reduce((acc: Record<string, number>, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  // Generate mock file changes
  const filesChanged = generateMockFiles(repoName);
  
  // Generate mock languages based on repo name
  const languages = generateMockLanguages(repoName);
  
  // Extract mock authors from commits
  const authors = Array.from(new Set(commits.map(commit => commit.author)));
  
  return {
    commits,
    filesChanged,
    languages,
    authors,
    commitCountByDate
  };
}

// Generate mock commits
function generateMockCommits(repoPath: string, days: number = 30) {
  const commits = [];
  const authors = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sam Wilson'];
  const now = new Date();
  
  // Use repo name as seed for pseudo-random generation
  const repoNameSum = repoPath.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  // Generate commit history
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Number of commits per day (1-3)
    const commitCount = (repoNameSum + i) % 3 + 1;
    
    for (let j = 0; j < commitCount; j++) {
      const authorIndex = (repoNameSum + i + j) % authors.length;
      commits.push({
        hash: generateMockCommitHash(),
        author: authors[authorIndex],
        date: date.toISOString(),
        message: generateMockCommitMessage((repoNameSum + i + j) % 5),
      });
    }
  }
  
  return commits;
}

// Generate mock file changes
function generateMockFiles(repoName: string) {
  const fileTypes = ['.js', '.ts', '.tsx', '.css', '.html', '.json', '.md'];
  const filesChanged = [];
  
  // Generate between 8-15 files
  const fileCount = Math.floor((repoName.length % 7) + 8);
  
  for (let i = 0; i < fileCount; i++) {
    const fileType = fileTypes[i % fileTypes.length];
    const fileName = fileType === '.md' ? 
      (i === 0 ? 'README.md' : `docs/guide-${i}.md`) : 
      `src/${['components', 'pages', 'services', 'utils'][i % 4]}/${repoName.toLowerCase()}-${i}${fileType}`;
    
    filesChanged.push({
      filename: fileName,
      changes: Math.floor(Math.random() * 200) + 10
    });
  }
  
  // Sort by most changes
  return filesChanged.sort((a, b) => b.changes - a.changes);
}

// Generate mock languages
function generateMockLanguages(repoName: string) {
  // Base languages with percentage allocation
  const languages: Record<string, number> = {
    JavaScript: 45,
    TypeScript: 30,
    CSS: 10,
    HTML: 5,
  };
  
  // Add some variation based on repo name
  const repoNameSum = repoName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  if (repoNameSum % 5 === 0) {
    languages.Python = 10;
    languages.JavaScript -= 5;
    languages.TypeScript -= 5;
  } else if (repoNameSum % 3 === 0) {
    languages.Java = 15;
    languages.JavaScript -= 10;
    languages.TypeScript -= 5;
  }
  
  return languages;
}

// Generate a mock commit hash
function generateMockCommitHash() {
  return Array.from({ length: 7 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Generate mock commit messages
function generateMockCommitMessage(type: number) {
  const messages = [
    "Add new feature",
    "Fix bug in component",
    "Update documentation",
    "Refactor code for better performance",
    "Merge pull request"
  ];
  
  return messages[type];
}

// Helper functions to get saved repository data
function getSavedRepoSummary() {
  const saved = localStorage.getItem('commitMetrics_lastRepo');
  if (!saved) {
    throw new Error('No repository data available. Please analyze a repository first.');
  }
  
  const { data } = JSON.parse(saved);
  return {
    totalCommits: data.commits.length,
    topFiles: data.filesChanged.slice(0, 5),
    languages: data.languages,
    authors: data.authors,
    commitCountByDate: data.commitCountByDate
  };
}

function getSavedCommits() {
  const saved = localStorage.getItem('commitMetrics_lastRepo');
  if (!saved) {
    throw new Error('No repository data available. Please analyze a repository first.');
  }
  
  return { commits: JSON.parse(saved).data.commits };
}

function getSavedLanguages() {
  const saved = localStorage.getItem('commitMetrics_lastRepo');
  if (!saved) {
    throw new Error('No repository data available. Please analyze a repository first.');
  }
  
  return JSON.parse(saved).data.languages;
}

function getSavedTopFiles(limit = 10) {
  const saved = localStorage.getItem('commitMetrics_lastRepo');
  if (!saved) {
    throw new Error('No repository data available. Please analyze a repository first.');
  }
  
  return JSON.parse(saved).data.filesChanged.slice(0, limit);
}

export default apiRequest;
