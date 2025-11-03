import type {
  Goal,
  Task,
  Feedback,
  Recognition,
  Review,
  User,
  GetGoalsParams,
  GetTasksParams,
  CreateGoalRequest,
  UpdateGoalRequest,
  SendFeedbackRequest,
  CreateRecognitionRequest,
} from '@/types/teamflect';

// Import mock data for fallback
import { mockGoals, mockTasks, mockFeedback, mockRecognitions, mockUsers, mockReviews } from '@/lib/mockData';

const API_KEY = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f';
const BASE_URL = 'https://api.teamflect.com/api/v1'; // Fixed: Added /api/v1
const USE_MOCK_DATA = false; // Set to true to use mock data for testing

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

class TeamflectAPI {
  // Goals
  async getGoals(params?: GetGoalsParams): Promise<Goal[]> {
    // Use mock data if API is not available
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock Goals data');
      return new Promise(resolve => setTimeout(() => resolve(mockGoals), 300));
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${BASE_URL}/goal/getGoals${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('API failed, using mock data');
      return mockGoals;
    }

    return response.json();
  }

  async createGoal(goal: CreateGoalRequest): Promise<Goal> {
    const response = await fetch(`${BASE_URL}/goal/createNewGoal`, {
      method: 'POST',
      headers,
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      throw new Error(`Failed to create goal: ${response.statusText}`);
    }

    return response.json();
  }

  async updateGoal(goal: UpdateGoalRequest): Promise<Goal> {
    const response = await fetch(`${BASE_URL}/goal/updateProgress`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      throw new Error(`Failed to update goal: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteGoal(goalId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/goal/deleteGoal`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id: goalId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete goal: ${response.statusText}`);
    }
  }

  // Tasks
  async getTasks(params?: GetTasksParams): Promise<Task[]> {
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock Tasks data');
      return new Promise(resolve => setTimeout(() => resolve(mockTasks), 300));
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${BASE_URL}/task${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('API failed, using mock data');
      return mockTasks;
    }

    return response.json();
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${BASE_URL}/task/createTask`, {
      method: 'POST',
      headers,
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }

  async updateTask(task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${BASE_URL}/task/updateTask`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/task/deleteTask`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id: taskId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  }

  // Feedback
  async sendFeedback(feedback: SendFeedbackRequest): Promise<Feedback> {
    if (USE_MOCK_DATA) {
      console.log('📊 Mock: Sending feedback');
      return new Promise(resolve => setTimeout(() => resolve(mockFeedback[0]), 300));
    }

    const response = await fetch(`${BASE_URL}/feedback/sendFeedbackRequest`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error(`Failed to send feedback: ${response.statusText}`);
    }

    return response.json();
  }

  async getFeedback(userOID?: string): Promise<Feedback[]> {
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock Feedback data');
      return new Promise(resolve => setTimeout(() => resolve(mockFeedback), 300));
    }

    const url = userOID
      ? `${BASE_URL}/feedback?userOID=${userOID}`
      : `${BASE_URL}/feedback`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('API failed, using mock data');
      return mockFeedback;
    }

    return response.json();
  }

  // Recognitions
  async createRecognition(recognition: CreateRecognitionRequest): Promise<Recognition> {
    if (USE_MOCK_DATA) {
      console.log('📊 Mock: Creating recognition');
      return new Promise(resolve => setTimeout(() => resolve(mockRecognitions[0]), 300));
    }

    const response = await fetch(`${BASE_URL}/recognition/createNewRecognitions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recognition),
    });

    if (!response.ok) {
      throw new Error(`Failed to create recognition: ${response.statusText}`);
    }

    return response.json();
  }

  async getRecognitions(userOID?: string): Promise<Recognition[]> {
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock Recognitions data');
      return new Promise(resolve => setTimeout(() => resolve(mockRecognitions), 300));
    }

    const url = userOID
      ? `${BASE_URL}/recognition?userOID=${userOID}`
      : `${BASE_URL}/recognition`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('API failed, using mock data');
      return mockRecognitions;
    }

    return response.json();
  }

  // Users
  async getUsers(): Promise<User[]> {
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock Users data');
      return new Promise(resolve => setTimeout(() => resolve(mockUsers), 300));
    }

    const response = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('API failed, using mock data');
      return mockUsers;
    }

    return response.json();
  }

  async updateUser(userOID: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${BASE_URL}/user/updateUser`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ oid: userOID, ...updates }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  // Reviews (if endpoint exists)
  async getReviews(userOID?: string): Promise<Review[]> {
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock Reviews data');
      return new Promise(resolve => setTimeout(() => resolve(mockReviews), 300));
    }

    const url = userOID
      ? `${BASE_URL}/review?userOID=${userOID}`
      : `${BASE_URL}/review`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('API failed, using mock data');
      return mockReviews;
    }

    return response.json();
  }
}

export const teamflectAPI = new TeamflectAPI();
