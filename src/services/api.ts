
// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://commit-metrics-api.onrender.com';

// Helper function for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    // Add timeout to fetch using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal
    });
    
    // Clear the timeout as request completed
    clearTimeout(timeoutId);

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
      throw new Error('Could not connect to the server. Please check your internet connection or try again later.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond.');
    }
    
    throw error;
  }
};

export default apiRequest;
