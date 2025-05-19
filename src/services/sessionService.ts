
import apiRequest from './api';

// Optional session storage service
// Types for session storage
export interface SessionData {
  repoPath: string;
  analysisData: any;
}

export interface SessionResponse {
  sessionId: string;
  message: string;
}

const sessionService = {
  // Save a session
  saveSession: (data: SessionData): Promise<SessionResponse> => {
    return apiRequest('/api/user/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get a session by ID
  getSession: (sessionId: string): Promise<SessionData> => {
    return apiRequest(`/api/user/session/${sessionId}`);
  }
};

export default sessionService;
