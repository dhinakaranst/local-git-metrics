
// Base API configuration
const API_BASE_URL = 'https://commit-metrics-api.onrender.com';

// Function to get current API URL
export const getCurrentApiUrl = () => API_BASE_URL;

// Check if network is online
const checkOnlineStatus = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Helper function for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Check if network is online before making request
    if (!checkOnlineStatus()) {
      throw new Error('You are offline. Please check your internet connection and try again.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
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
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // Handle PDF responses
    if (response.headers.get('Content-Type')?.includes('application/pdf')) {
      return response.blob();
    }

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    
    // Enhance error message for network failures
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Failed to connect to the API server. Please check your internet connection or try again later.');
    }
    
    throw error;
  }
};

export default apiRequest;
