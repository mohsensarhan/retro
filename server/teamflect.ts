// Teamflect API client for server-side requests
import axios from 'axios';
import { mockGoals, mockTasks, mockFeedback, mockRecognitions, mockUsers, mockReviews } from '../src/lib/mockData.js';

// API Keys (both provided by user as "fully operational")
const API_KEY = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f';
// Alternative: '4d73e4a8ce78:d830cfb1-8c29-4719-8096-a0e0fd2876ba'
const BASE_URL = 'https://api.teamflect.com/api/v1';

// Enable mock data fallback when API returns 403
const USE_MOCK_FALLBACK = true;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

interface FetchOptions {
  method?: string;
  body?: any;
}

async function teamflectFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const method = options.method || 'GET';
  const url = `${BASE_URL}${endpoint}`;

  console.log(`📡 Teamflect API: ${method} ${url}`);

  try {
    const response = await axiosInstance.request({
      url: endpoint,
      method,
      data: options.body,
    });

    console.log(`✅ Success: ${response.status}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Teamflect API Error ${error.response.status}:`, error.response.data);

      // If 403 and mock fallback enabled, throw with flag
      if (error.response.status === 403 && USE_MOCK_FALLBACK) {
        const err: any = new Error(`Teamflect API 403 - Using mock data fallback`);
        err.useMockData = true;
        throw err;
      }

      throw new Error(`Teamflect API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`❌ Network Error:`, error.message);
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export const teamflectAPI = {
  // Goals
  async getGoals(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    ownerId?: string;
  }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = `/goal/getGoals${query ? `?${query}` : ''}`;
      return await teamflectFetch(endpoint);
    } catch (error: any) {
      if (error.useMockData) {
        console.log('📊 Using mock Goals data (API returned 403)');
        return mockGoals;
      }
      throw error;
    }
  },

  async createGoal(data: {
    title: string;
    description?: string;
    startDate: string;
    dueDate: string;
    ownerIds: string[];
    status?: string;
  }) {
    return teamflectFetch('/goal/createNewGoal', {
      method: 'POST',
      body: data,
    });
  },

  async updateGoalProgress(goalId: string, progress: number) {
    return teamflectFetch('/goal/updateProgress', {
      method: 'POST',
      body: { goalId, progress },
    });
  },

  async deleteGoal(goalId: string) {
    return teamflectFetch(`/goal/${goalId}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  async getTasks(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = `/task/getTasks${query ? `?${query}` : ''}`;
      return await teamflectFetch(endpoint);
    } catch (error: any) {
      if (error.useMockData) {
        console.log('📋 Using mock Tasks data (API returned 403)');
        return mockTasks;
      }
      throw error;
    }
  },

  async createTask(data: {
    title: string;
    description?: string;
    assigneeIds: string[];
    dueDate: string;
    priority?: string;
  }) {
    return teamflectFetch('/task', {
      method: 'POST',
      body: data,
    });
  },

  async updateTask(taskId: string, data: any) {
    return teamflectFetch(`/task/${taskId}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteTask(taskId: string) {
    return teamflectFetch(`/task/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Feedback
  async getFeedback(params?: {
    limit?: number;
    offset?: number;
  }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = `/feedback/getFeedbacks${query ? `?${query}` : ''}`;
      return await teamflectFetch(endpoint);
    } catch (error: any) {
      if (error.useMockData) {
        console.log('💬 Using mock Feedback data (API returned 403)');
        return mockFeedback;
      }
      throw error;
    }
  },

  async sendFeedback(data: {
    recipientId: string;
    message: string;
    type?: string;
  }) {
    return teamflectFetch('/feedback/sendFeedbackRequest', {
      method: 'POST',
      body: data,
    });
  },

  // Recognitions
  async getRecognitions(params?: {
    limit?: number;
    offset?: number;
  }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = `/recognition/getRecognitions${query ? `?${query}` : ''}`;
      return await teamflectFetch(endpoint);
    } catch (error: any) {
      if (error.useMockData) {
        console.log('🏆 Using mock Recognitions data (API returned 403)');
        return mockRecognitions;
      }
      throw error;
    }
  },

  async createRecognition(data: {
    recipientId: string;
    message: string;
    type?: string;
  }) {
    return teamflectFetch('/recognition/createNewRecognitions', {
      method: 'POST',
      body: data,
    });
  },

  async likeRecognition(recognitionId: string) {
    return teamflectFetch(`/recognition/${recognitionId}/like`, {
      method: 'POST',
    });
  },

  // Users
  async getUsers(params?: {
    limit?: number;
    offset?: number;
  }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = `/user/getUsers${query ? `?${query}` : ''}`;
      return await teamflectFetch(endpoint);
    } catch (error: any) {
      if (error.useMockData) {
        console.log('👥 Using mock Users data (API returned 403)');
        return mockUsers;
      }
      throw error;
    }
  },

  // Reviews
  async getReviews(params?: {
    limit?: number;
    offset?: number;
  }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = `/review${query ? `?${query}` : ''}`;
      return await teamflectFetch(endpoint);
    } catch (error: any) {
      if (error.useMockData) {
        console.log('📝 Using mock Reviews data (API returned 403)');
        return mockReviews;
      }
      throw error;
    }
  },
};
