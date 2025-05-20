
// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://commit-metrics-api.onrender.com';

// Helper function for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    // Add timeout to fetch using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increase timeout to 60 seconds
    
    // Retry logic
    let retries = 2;
    let response;
    let lastError;
    
    while (retries >= 0) {
      try {
        console.log(`Attempt ${2 - retries + 1} to connect to ${url}`);
        
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
        console.error(`Attempt ${2 - retries + 1} failed:`, error);
        
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          const delay = 1000 * Math.pow(2, 2 - retries);
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
      throw new Error('Could not connect to the server. Please check your internet connection and try again. The API server may be starting up from cold storage (this can take up to 2 minutes).');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond. The API may be processing a large repository.');
    }
    
    throw error;
  }
};

export default apiRequest;
