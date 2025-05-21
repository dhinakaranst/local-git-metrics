
// Base API configuration
const API_BASE_URL = 'https://commit-metrics-api.onrender.com';

// Helper function for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
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
    throw error;
  }
};

export default apiRequest;
