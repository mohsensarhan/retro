/**
 * Teamflect API Integration Layer - PRODUCTION
 *
 * Complete CRUD operations for all Teamflect API endpoints
 * NO MOCK DATA - Real API only
 *
 * API Base: https://api.teamflect.com/api/v1
 * Auth: x-api-key header (NOT Bearer)
 *
 * Available Endpoints:
 * - Users: GET /users, GET /users/{id}
 * - Tasks: GET/POST/PUT/DELETE /tasks
 * - Goals: GET/POST/PUT/DELETE /goals
 * - Recognitions: GET/POST /recognitions
 * - Feedback: GET/POST /feedback
 * - 1-on-1s: GET/POST /one-on-ones
 * - Reviews: GET /reviews
 */

const API_BASE_URL = 'https://api.teamflect.com/api/v1'

// Get API credentials
const getApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TEAMFLECT_API_KEY) {
    return import.meta.env.VITE_TEAMFLECT_API_KEY
  }
  return '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f'
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  params?: Record<string, string | number | boolean>
}

export class TeamflectApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'TeamflectApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options

  // Build URL
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  const apiKey = getApiKey()

  // Headers WITHOUT Bearer - use x-api-key or api-key header
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': apiKey, // Primary method
    'api-key': apiKey,    // Backup
  }

  const config: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  }

  try {
    console.log(`[API] ${method} ${endpoint}`, params || '')
    const response = await fetch(url.toString(), config)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API Error] ${response.status}:`, errorText)

      throw new TeamflectApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      )
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log(`[API Success] ${method} ${endpoint}:`, Array.isArray(data) ? `${data.length} items` : 'OK')
      return data
    }

    return {} as T
  } catch (error) {
    if (error instanceof TeamflectApiError) {
      throw error
    }
    console.error('[API Network Error]:', error)
    throw new TeamflectApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  id: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  department?: string
  managerId?: string | null
  photoUrl?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string
  assignerId: string
  dueDate?: string
  startDate?: string
  completedDate?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  type: 'individual' | 'team' | 'company'
  status: 'not_started' | 'on_track' | 'at_risk' | 'off_track' | 'achieved' | 'cancelled'
  progress: number
  ownerId: string
  parentGoalId?: string | null
  startDate: string
  endDate: string
  keyResults?: KeyResult[]
  alignedGoals?: string[]
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface KeyResult {
  id: string
  title: string
  description?: string
  progress: number
  target: number
  current: number
  unit: string
  status?: 'on_track' | 'at_risk' | 'off_track' | 'achieved'
}

export interface Recognition {
  id: string
  senderId: string
  receiverId: string
  message: string
  type?: 'praise' | 'thank_you' | 'achievement' | 'teamwork'
  isPublic?: boolean
  createdAt: string
}

export interface Feedback {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'one_on_one' | 'performance_review' | 'peer_feedback' | 'upward_feedback'
  isPrivate?: boolean
  createdAt: string
  updatedAt?: string
}

export interface OneOnOne {
  id: string
  participantIds: string[]
  title?: string
  scheduledDate: string
  duration?: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  actionItems?: ActionItem[]
  createdAt: string
  updatedAt?: string
}

export interface ActionItem {
  id: string
  description: string
  ownerId: string
  dueDate?: string
  isCompleted: boolean
}

export interface Review {
  id: string
  reviewerId: string
  revieweeId: string
  cycle: string
  status: 'not_started' | 'in_progress' | 'completed'
  overallRating?: number
  competencies?: CompetencyRating[]
  comments?: string
  createdAt: string
  updatedAt?: string
}

export interface CompetencyRating {
  competency: string
  rating: number
  comments?: string
}

// ============================================================================
// API METHODS - COMPLETE CRUD FOR ALL ENDPOINTS
// ============================================================================

export const teamflectApi = {
  // ==================== USERS ====================
  users: {
    getAll: () => apiRequest<User[]>('/users'),

    getById: (userId: string) => apiRequest<User>(`/users/${userId}`),

    getByDepartment: (department: string) =>
      apiRequest<User[]>('/users', { params: { department } }),

    getDirectReports: (managerId: string) =>
      apiRequest<User[]>('/users', { params: { managerId } }),

    search: (query: string) =>
      apiRequest<User[]>('/users', { params: { search: query } }),
  },

  // ==================== TASKS ====================
  tasks: {
    getAll: (params?: {
      assigneeId?: string
      assignerId?: string
      status?: Task['status']
      priority?: Task['priority']
    }) => apiRequest<Task[]>('/tasks', { params: params as any }),

    getById: (taskId: string) => apiRequest<Task>(`/tasks/${taskId}`),

    create: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiRequest<Task>('/tasks', { method: 'POST', body: task }),

    update: (taskId: string, updates: Partial<Task>) =>
      apiRequest<Task>(`/tasks/${taskId}`, { method: 'PUT', body: updates }),

    delete: (taskId: string) =>
      apiRequest<void>(`/tasks/${taskId}`, { method: 'DELETE' }),

    complete: (taskId: string) =>
      apiRequest<Task>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: { status: 'completed', completedDate: new Date().toISOString() },
      }),

    assign: (taskId: string, assigneeId: string) =>
      apiRequest<Task>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: { assigneeId },
      }),
  },

  // ==================== GOALS ====================
  goals: {
    getAll: (params?: {
      ownerId?: string
      type?: Goal['type']
      status?: Goal['status']
    }) => apiRequest<Goal[]>('/goals', { params: params as any }),

    getById: (goalId: string) => apiRequest<Goal>(`/goals/${goalId}`),

    getHierarchy: (parentGoalId?: string) =>
      apiRequest<Goal[]>('/goals', {
        params: { parentGoalId: parentGoalId || '' } as any,
      }),

    getCompanyGoals: () =>
      apiRequest<Goal[]>('/goals', { params: { type: 'company' } }),

    getTeamGoals: () =>
      apiRequest<Goal[]>('/goals', { params: { type: 'team' } }),

    create: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiRequest<Goal>('/goals', { method: 'POST', body: goal }),

    update: (goalId: string, updates: Partial<Goal>) =>
      apiRequest<Goal>(`/goals/${goalId}`, { method: 'PUT', body: updates }),

    updateProgress: (goalId: string, progress: number) =>
      apiRequest<Goal>(`/goals/${goalId}`, {
        method: 'PUT',
        body: { progress },
      }),

    delete: (goalId: string) =>
      apiRequest<void>(`/goals/${goalId}`, { method: 'DELETE' }),
  },

  // ==================== RECOGNITIONS ====================
  recognitions: {
    getAll: (params?: { receiverId?: string; senderId?: string }) =>
      apiRequest<Recognition[]>('/recognitions', { params: params as any }),

    getById: (recognitionId: string) =>
      apiRequest<Recognition>(`/recognitions/${recognitionId}`),

    create: (recognition: Omit<Recognition, 'id' | 'createdAt'>) =>
      apiRequest<Recognition>('/recognitions', {
        method: 'POST',
        body: recognition,
      }),

    getRecent: (limit: number = 10) =>
      apiRequest<Recognition[]>('/recognitions', { params: { limit } }),
  },

  // ==================== FEEDBACK ====================
  feedback: {
    getAll: (params?: { receiverId?: string; senderId?: string; type?: Feedback['type'] }) =>
      apiRequest<Feedback[]>('/feedback', { params: params as any }),

    getById: (feedbackId: string) =>
      apiRequest<Feedback>(`/feedback/${feedbackId}`),

    create: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiRequest<Feedback>('/feedback', { method: 'POST', body: feedback }),
  },

  // ==================== ONE-ON-ONES ====================
  oneOnOnes: {
    getAll: (userId?: string) =>
      apiRequest<OneOnOne[]>('/one-on-ones', {
        params: userId ? { userId } : undefined,
      }),

    getById: (oneOnOneId: string) =>
      apiRequest<OneOnOne>(`/one-on-ones/${oneOnOneId}`),

    create: (oneOnOne: Omit<OneOnOne, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiRequest<OneOnOne>('/one-on-ones', {
        method: 'POST',
        body: oneOnOne,
      }),

    update: (oneOnOneId: string, updates: Partial<OneOnOne>) =>
      apiRequest<OneOnOne>(`/one-on-ones/${oneOnOneId}`, {
        method: 'PUT',
        body: updates,
      }),

    getUpcoming: () =>
      apiRequest<OneOnOne[]>('/one-on-ones', {
        params: { status: 'scheduled' },
      }),
  },

  // ==================== REVIEWS ====================
  reviews: {
    getAll: (params?: { revieweeId?: string; cycle?: string }) =>
      apiRequest<Review[]>('/reviews', { params: params as any }),

    getById: (reviewId: string) =>
      apiRequest<Review>(`/reviews/${reviewId}`),

    getMy: (userId: string) =>
      apiRequest<Review[]>('/reviews', { params: { revieweeId: userId } }),
  },
}
