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

// Function to wake up the server silently in the background
// export const wakeUpServer = async (): Promise<boolean> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/health`, { 
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' }
//     });
//     return response.ok;
//   } catch (error) {
//     // Silently handle errors without showing to the user
//     return false;
//   }
// };

// Helper function for making API requests with retry capability
const apiRequest = async (endpoint: string, options: RequestInit = {}, retries = 3) => {
  try {
    // Check if network is online before making request
    if (!checkOnlineStatus()) {
      throw new Error('Network connection issue. Please check your internet connection and try again.');
    }

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
        throw new Error(errorData.message || `Request failed. Please try again.`);
      }

      // Handle PDF responses
      if (response.headers.get('Content-Type')?.includes('application/pdf')) {
        return response.blob();
      }

      return response.json();
    } catch (error) {
      // If we have retries left and it's a network error, retry the request
      if (retries > 0 && error instanceof TypeError && error.message === 'Failed to fetch') {
        // Wait before retrying (exponential backoff)
        await delay(1000 * (4 - retries));
        return apiRequest(endpoint, options, retries - 1);
      }
      throw error;
    }
  } catch (error) {
    console.error('API request error:', error);
    
    // Enhance error message but keep it generic for users
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect. Please try again later.');
    }
    
    throw error;
  }
};

export default apiRequest;
