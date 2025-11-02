/**
 * Teamflect API Integration Layer - PRODUCTION
 *
 * Based on official Swagger documentation
 * NO MOCK DATA - Real API only
 *
 * API Base: https://api.teamflect.com/api/v1
 * Swagger: https://api.teamflect.com/api/v1/
 *
 * Actual Endpoints from Swagger:
 * - Feedbacks: /feedback/*
 * - Goals: /goal/*
 * - Recognitions: /recognition/*
 * - Reviews: /review/*
 * - Tasks: /task/*
 * - Users: /user/*
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

  // Use x-api-key header as confirmed by user
  const headers: HeadersInit = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
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
// TYPE DEFINITIONS (Based on Swagger Models)
// ============================================================================

export interface User {
  userPrincipalName: string
  createdAt?: string
  lastLoginDate?: string
  department?: string
  employeeHireDate?: string
  role?: string
  country?: string
  hasManager?: boolean
  isManager?: boolean
  jobTitle?: string
  officeLocation?: string
  preferredLanguage?: string
  name?: string
  attachments?: any[]
  // Additional fields
  oid?: string
  displayName?: string
  id?: string
  mail?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  assigneeId?: string
  assignerId?: string
  dueDate?: string
  startDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  goalType: {
    _id: string
    goalLevel: number
    visibleName: string
    color?: string
    icon?: string
  }
  owners: User[]
  createdBy: {
    oid: string
    displayName: string
    userPrincipalName: string
  }
  startDate: string
  dueDate: string
  isPrivate: boolean
  createdAt: string
  relatedGroups?: any[]
  labels?: any[]
  parentGoal?: any
  progress?: {
    formatType: string
    initialValue: number
    targetValue: number
    currentValue: number
  }
  status: string
  outcome?: string
  progressUpdates?: Array<{
    updatedAt: string
    updatedBy: any
    oldValue: number
    newValue: number
    oldProgressPercent: number
    newProgressPercent: number
    comment?: string
  }>
  comments?: Array<{
    userPrincipalName: string
    displayName: string
    oid: string
    comment: string
    createdAt: string
  }>
}

export interface Recognition {
  id: string
  createdAt: string
  createdBy: {
    oid: string
    displayName: string
    userPrincipalName: string
  }
  recipient?: {
    oid: string
    displayName: string
    userPrincipalName: string
  }
  message?: string
  type?: string
}

export interface Feedback {
  id: string
  createdAt: string
  dueDate?: string
  submittedAt?: string
  requestNote?: string
  status: string
  submittedBy?: {
    oid: string
    displayName: string
    userPrincipalName: string
  }
  about?: {
    oid: string
    displayName: string
    userPrincipalName: string
  }
  isPrivate?: boolean
  isAnonymous?: boolean
  isExternal?: boolean
  questions?: Array<{
    question: string
    answer: string
  }>
}

export interface Review {
  id: string
  createdAt?: string
  status: string
  reviewee?: User
  reviewer?: User
  cycle?: string
}

export interface OneOnOne {
  id: string
  title?: string
  scheduledDate: string
  status: string
  participants?: User[]
}

// ============================================================================
// API METHODS - Based on actual Swagger endpoints
// ============================================================================

export const teamflectApi = {
  // ==================== USERS ====================
  users: {
    // GET /user/getUser
    getByEmail: (userMail: string) =>
      apiRequest<User>('/user/getUser', { params: { userMail } }),

    // POST /user/updateUser
    update: (userData: Partial<User>) =>
      apiRequest<User>('/user/updateUser', { method: 'POST', body: userData }),

    // Helper to get all users (may need different endpoint if it exists)
    getAll: () =>
      apiRequest<User[]>('/user/getUser', {}), // May need adjustment
  },

  // ==================== TASKS ====================
  tasks: {
    // GET /task/{taskId}
    getById: (taskId: string) =>
      apiRequest<Task>(`/task/${taskId}`),

    // GET /task (with filters)
    getAll: (filters?: any) =>
      apiRequest<Task[]>('/task', { params: filters }),

    // Note: Create/Update endpoints not shown in provided Swagger
    // Will need to check if they exist or use different methods
  },

  // ==================== GOALS ====================
  goals: {
    // GET /goal/getGoal
    getById: (goalId: string) =>
      apiRequest<Goal>('/goal/getGoal', { params: { goalId } }),

    // GET /goal/getGoals
    getAll: (filters?: {
      ownerUPN?: string
      startDate?: string
      endDate?: string
      goalTypeId?: string
      status?: string
      limit?: number
      skip?: number
    }) => apiRequest<Goal[]>('/goal/getGoals', { params: filters as any }),

    // POST /goal/createNewGoal
    create: (goalData: {
      title: string
      description?: string
      startDate: string
      dueDate: string
      goalTypeId: string
      ownerUPNorIds: string[]
      isPrivate?: boolean
      parentGoalId?: string
      progressFormatType?: string
      progressInitialValue?: number
      progressTargetValue?: number
    }) => apiRequest<Goal>('/goal/createNewGoal', { method: 'POST', body: goalData }),

    // POST /goal/updateProgress
    updateProgress: (progressData: {
      goalId: string
      newValue: number
      comment?: string
    }) => apiRequest<Goal>('/goal/updateProgress', { method: 'POST', body: progressData }),

    // POST /goal/commentGoal
    addComment: (commentData: {
      goalId: string
      comment: string
    }) => apiRequest<Goal>('/goal/commentGoal', { method: 'POST', body: commentData }),
  },

  // ==================== RECOGNITIONS ====================
  recognitions: {
    // GET /recognition/{recognitionId}
    getById: (recognitionId: string) =>
      apiRequest<Recognition>(`/recognition/${recognitionId}`),

    // POST /recognition (search/filter)
    search: (filters?: any) =>
      apiRequest<Recognition[]>('/recognition', { method: 'POST', body: filters }),

    // POST /recognition/createNewRecognitions
    create: (recognitionData: {
      recipientUPNorIds: string[]
      message: string
      recognitionTypeId?: string
    }) => apiRequest<Recognition>('/recognition/createNewRecognitions', {
      method: 'POST',
      body: recognitionData,
    }),
  },

  // ==================== FEEDBACK ====================
  feedback: {
    // GET /feedback/getFeedbacks
    getAll: (filters?: {
      feedbackAboutUPN?: string
      feedbackSubmittedByUPN?: string
      startDate?: string
      endDate?: string
      relatedReviewId?: string
      related360DegreeFeedbackId?: string
      limit?: number
      skip?: number
    }) => apiRequest<Feedback[]>('/feedback/getFeedbacks', { params: filters as any }),

    // POST /feedback/sendFeedbackRequest
    sendRequest: (requestData: {
      feedbackAboutUPNorId: string
      feedbackRequestReceiverUPNorId: string
      feedbackNote?: string
      templateTitle?: string
      dueDateInDays?: number
      isPrivate?: boolean
    }) => apiRequest<Feedback>('/feedback/sendFeedbackRequest', {
      method: 'POST',
      body: requestData,
    }),

    // POST /feedback/sendExternalFeedbackRequest
    sendExternalRequest: (requestData: {
      feedbackAboutUPNorId: string
      externalEmail: string
      onBehalfName?: string
      feedbackNote?: string
      templateTitle?: string
      dueDateInDays?: number
      isPrivate?: boolean
      isAnonymous?: boolean
    }) => apiRequest<Feedback>('/feedback/sendExternalFeedbackRequest', {
      method: 'POST',
      body: requestData,
    }),
  },

  // ==================== REVIEWS ====================
  reviews: {
    // GET /review/getReviews
    getAll: (filters?: {
      revieweeUPN?: string
      reviewerUPN?: string
      cycleId?: string
      status?: string
      startDate?: string
      endDate?: string
      limit?: number
      skip?: number
    }) => apiRequest<Review[]>('/review/getReviews', { params: filters as any }),
  },
}
