
// Base API configuration
const DEFAULT_API_BASE_URL = 'https://commit-metrics-api.onrender.com';
// Allow custom API URL from local storage or environment variable
const getApiBaseUrl = () => {
  const customUrl = localStorage.getItem('CUSTOM_API_URL');
  return customUrl || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
};

// Helper function for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    // Add timeout to fetch using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // Increase timeout to 2 minutes
    
    // Retry logic with increased attempts
    let retries = 3; // Increase from 2 to 3 retries
    let response;
    let lastError;
    
    while (retries >= 0) {
      try {
        console.log(`Attempt ${3 - retries + 1} to connect to ${url}`);
        
        response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal
        });
        
        // If successful, break out of retry loop
        break;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${3 - retries + 1} failed:`, error);
        
        if (retries > 0) {
          // Wait before retrying (exponential backoff with longer delays)
          const delay = 2000 * Math.pow(2, 3 - retries); // Increased base delay to 2 seconds
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        retries--;
      }
    }
    
    // Clear the timeout as request completed or failed
    clearTimeout(timeoutId);
    
    // If all retries failed
    if (!response) {
      throw lastError || new Error('Failed to connect after multiple attempts');
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // Handle PDF responses
    if (response.headers.get('Content-Type')?.includes('application/pdf')) {
      return response.blob();
    }

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    
    // Provide more user-friendly error messages
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Could not connect to the server. Please check your internet connection and try again. The API server may be starting up from cold storage (this can take up to 2 minutes). Please wait and try again.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out after 2 minutes. The server took too long to respond. The API may be processing a large repository or is currently unavailable.');
    }
    
    throw error;
  }
};

// Export function to set custom API URL
export const setCustomApiUrl = (url: string) => {
  if (url && url.trim() !== '') {
    localStorage.setItem('CUSTOM_API_URL', url.trim());
    console.log(`Custom API URL set to: ${url}`);
    return true;
  } else {
    localStorage.removeItem('CUSTOM_API_URL');
    console.log('Custom API URL removed, using default');
    return false;
  }
};

// Export function to get current API URL
export const getCurrentApiUrl = () => {
  return getApiBaseUrl();
};

// Check if API is reachable
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Short timeout for health check
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default apiRequest;
