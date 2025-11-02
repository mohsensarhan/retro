/**
 * Teamflect API Integration Layer
 *
 * API Credentials Format: tenantId:apiKey
 * Base URL: https://api.teamflect.com/api/v1
 *
 * Available Endpoints:
 * - /users - Get all users in the organization
 * - /tasks - Get all tasks
 * - /goals - Get all goals/OKRs
 * - /recognitions - Get all recognitions
 * - /feedback - Get all feedback
 */

const API_BASE_URL = 'https://api.teamflect.com/api/v1'
const API_CREDENTIALS = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f'

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  params?: Record<string, string>
}

async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options

  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Build headers - trying multiple auth methods based on API documentation
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  // Try Bearer token format (most common for modern APIs)
  headers['Authorization'] = `Bearer ${API_CREDENTIALS}`

  const config: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  }

  try {
    const response = await fetch(url.toString(), config)

    if (!response.ok) {
      // If Bearer fails, try Basic Auth
      if (response.status === 401 || response.status === 403) {
        const basicAuthHeaders = {
          ...headers,
          'Authorization': `Basic ${btoa(API_CREDENTIALS)}`,
        }

        const retryResponse = await fetch(url.toString(), {
          ...config,
          headers: basicAuthHeaders,
        })

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status} ${retryResponse.statusText}`)
        }

        return await retryResponse.json()
      }

      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Type definitions based on Teamflect API structure
export interface User {
  id: string
  email: string
  displayName: string
  jobTitle?: string
  department?: string
  managerId?: string
  photoUrl?: string
  isActive: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string
  assignerId: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  type: 'individual' | 'team' | 'company'
  status: 'not_started' | 'on_track' | 'at_risk' | 'achieved'
  progress: number
  ownerId: string
  startDate: string
  endDate: string
  keyResults?: KeyResult[]
}

export interface KeyResult {
  id: string
  title: string
  progress: number
  target: number
  current: number
  unit: string
}

export interface Recognition {
  id: string
  senderId: string
  receiverId: string
  message: string
  type: 'praise' | 'thank_you' | 'achievement'
  createdAt: string
}

export interface Feedback {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: '1on1' | 'performance_review' | 'peer_feedback'
  createdAt: string
}

// API Methods
export const teamflectApi = {
  // Users
  getUsers: () => apiRequest<User[]>('/users'),
  getUser: (userId: string) => apiRequest<User>(`/users/${userId}`),

  // Tasks
  getTasks: (params?: { assigneeId?: string; status?: string }) =>
    apiRequest<Task[]>('/tasks', { params: params as any }),
  createTask: (task: Partial<Task>) =>
    apiRequest<Task>('/tasks', { method: 'POST', body: task }),
  updateTask: (taskId: string, updates: Partial<Task>) =>
    apiRequest<Task>(`/tasks/${taskId}`, { method: 'PATCH', body: updates }),
  deleteTask: (taskId: string) =>
    apiRequest<void>(`/tasks/${taskId}`, { method: 'DELETE' }),

  // Goals
  getGoals: (params?: { ownerId?: string; type?: string }) =>
    apiRequest<Goal[]>('/goals', { params: params as any }),
  getGoal: (goalId: string) => apiRequest<Goal>(`/goals/${goalId}`),
  createGoal: (goal: Partial<Goal>) =>
    apiRequest<Goal>('/goals', { method: 'POST', body: goal }),
  updateGoal: (goalId: string, updates: Partial<Goal>) =>
    apiRequest<Goal>(`/goals/${goalId}`, { method: 'PATCH', body: updates }),

  // Recognitions
  getRecognitions: (params?: { receiverId?: string }) =>
    apiRequest<Recognition[]>('/recognitions', { params: params as any }),
  createRecognition: (recognition: Partial<Recognition>) =>
    apiRequest<Recognition>('/recognitions', { method: 'POST', body: recognition }),

  // Feedback
  getFeedback: (params?: { receiverId?: string }) =>
    apiRequest<Feedback[]>('/feedback', { params: params as any }),
}

// Mock data for development and testing
export const mockData = {
  users: [
    {
      id: '1',
      email: 'ceo@efb.org',
      displayName: 'Mohsen Sarhan',
      jobTitle: 'Chief Executive Officer',
      department: 'Executive',
      isActive: true,
    },
    {
      id: '2',
      email: 'programs@efb.org',
      displayName: 'Ahmed Hassan',
      jobTitle: 'Director of Programs',
      department: 'Programs',
      managerId: '1',
      isActive: true,
    },
    {
      id: '3',
      email: 'operations@efb.org',
      displayName: 'Fatima Ali',
      jobTitle: 'Director of Operations',
      department: 'Operations',
      managerId: '1',
      isActive: true,
    },
    {
      id: '4',
      email: 'fundraising@efb.org',
      displayName: 'Omar Khalil',
      jobTitle: 'Director of Fundraising',
      department: 'Development',
      managerId: '1',
      isActive: true,
    },
  ] as User[],

  tasks: [
    {
      id: '1',
      title: 'Q1 Fundraising Campaign Launch',
      description: 'Launch the Q1 fundraising campaign targeting corporate partnerships',
      status: 'in_progress',
      priority: 'high',
      assigneeId: '4',
      assignerId: '1',
      dueDate: '2025-11-15',
      createdAt: '2025-11-01',
      updatedAt: '2025-11-02',
    },
    {
      id: '2',
      title: 'Food Distribution Network Expansion',
      description: 'Expand distribution network to 5 new regions',
      status: 'in_progress',
      priority: 'urgent',
      assigneeId: '3',
      assignerId: '1',
      dueDate: '2025-11-30',
      createdAt: '2025-10-15',
      updatedAt: '2025-11-02',
    },
  ] as Task[],

  goals: [
    {
      id: '1',
      title: 'Reach 1 Million Beneficiaries',
      description: 'Expand our reach to serve 1 million beneficiaries by end of year',
      type: 'company',
      status: 'on_track',
      progress: 65,
      ownerId: '1',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    },
    {
      id: '2',
      title: 'Double Fundraising Revenue',
      description: 'Increase fundraising revenue to $10M',
      type: 'team',
      status: 'on_track',
      progress: 45,
      ownerId: '4',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    },
  ] as Goal[],

  recognitions: [
    {
      id: '1',
      senderId: '1',
      receiverId: '2',
      message: 'Outstanding work on the recent food distribution campaign!',
      type: 'praise',
      createdAt: '2025-11-01',
    },
  ] as Recognition[],
}
