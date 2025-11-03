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

const API_KEY = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f';
const BASE_URL = 'https://api.teamflect.com';

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

class TeamflectAPI {
  // Goals
  async getGoals(params?: GetGoalsParams): Promise<Goal[]> {
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
      throw new Error(`Failed to fetch goals: ${response.statusText}`);
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
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
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
    const url = userOID
      ? `${BASE_URL}/feedback?userOID=${userOID}`
      : `${BASE_URL}/feedback`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feedback: ${response.statusText}`);
    }

    return response.json();
  }

  // Recognitions
  async createRecognition(recognition: CreateRecognitionRequest): Promise<Recognition> {
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
    const url = userOID
      ? `${BASE_URL}/recognition?userOID=${userOID}`
      : `${BASE_URL}/recognition`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recognitions: ${response.statusText}`);
    }

    return response.json();
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
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
    const url = userOID
      ? `${BASE_URL}/review?userOID=${userOID}`
      : `${BASE_URL}/review`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }

    return response.json();
  }
}

export const teamflectAPI = new TeamflectAPI();
