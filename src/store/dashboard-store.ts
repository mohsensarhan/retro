import { create } from 'zustand'
import { User, Task, Goal, Recognition, Feedback, teamflectApi, TeamflectApiError } from '@/lib/teamflect-api'

interface DashboardState {
  // Data - REAL API ONLY
  users: User[]
  tasks: Task[]
  goals: Goal[]
  recognitions: Recognition[]
  feedback: Feedback[]

  // UI State
  isLoading: boolean
  error: string | null
  selectedView: 'overview' | 'tasks' | 'goals' | 'team' | 'recognitions'
  selectedUserId: string | null

  // Actions
  fetchAllData: () => Promise<void>
  refreshData: () => Promise<void>

  // View management
  setSelectedView: (view: DashboardState['selectedView']) => void
  setSelectedUser: (userId: string | null) => void

  // Goal CRUD (available in API)
  createGoal: (goalData: any) => Promise<Goal>
  updateGoalProgress: (goalId: string, newValue: number, comment?: string) => Promise<void>
  addGoalComment: (goalId: string, comment: string) => Promise<void>

  // Recognition (available in API)
  createRecognition: (recipientUPNorIds: string[], message: string) => Promise<void>

  // Feedback (available in API)
  sendFeedbackRequest: (data: any) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state - EMPTY until API loads
  users: [],
  tasks: [],
  goals: [],
  recognitions: [],
  feedback: [],
  isLoading: false,
  error: null,
  selectedView: 'overview',
  selectedUserId: null,

  // ==================== FETCH ALL DATA ====================
  fetchAllData: async () => {
    set({ isLoading: true, error: null })

    try {
      console.log('[Store] Fetching all data from Teamflect API...')

      const [tasks, goals, recognitions, feedback] = await Promise.all([
        teamflectApi.tasks.getAll().catch(err => {
          console.warn('Tasks fetch failed:', err)
          return []
        }),
        teamflectApi.goals.getAll().catch(err => {
          console.warn('Goals fetch failed:', err)
          return []
        }),
        teamflectApi.recognitions.search({}).catch(err => {
          console.warn('Recognitions fetch failed:', err)
          return []
        }),
        teamflectApi.feedback.getAll().catch(err => {
          console.warn('Feedback fetch failed:', err)
          return []
        }),
      ])

      // Extract users from goals (owners) since there's no direct users endpoint
      const usersMap = new Map<string, User>()
      goals.forEach(goal => {
        goal.owners?.forEach(owner => {
          if (owner.userPrincipalName) {
            usersMap.set(owner.userPrincipalName, owner)
          }
        })
        if (goal.createdBy?.userPrincipalName) {
          usersMap.set(goal.createdBy.userPrincipalName, {
            userPrincipalName: goal.createdBy.userPrincipalName,
            displayName: goal.createdBy.displayName,
            oid: goal.createdBy.oid,
            name: goal.createdBy.displayName,
          } as User)
        }
      })

      const users = Array.from(usersMap.values())

      console.log('[Store] Data loaded successfully:', {
        users: users.length,
        tasks: tasks.length,
        goals: goals.length,
        recognitions: recognitions.length,
        feedback: feedback.length,
      })

      set({
        users,
        tasks,
        goals,
        recognitions,
        feedback,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('[Store] Error fetching data:', error)

      const errorMessage =
        error instanceof TeamflectApiError
          ? `API Error (${error.status}): ${error.message}`
          : `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`

      set({
        error: errorMessage,
        isLoading: false,
      })

      throw error
    }
  },

  refreshData: async () => {
    await get().fetchAllData()
  },

  // ==================== VIEW MANAGEMENT ====================
  setSelectedView: (view) => set({ selectedView: view }),

  setSelectedUser: (userId) => set({ selectedUserId: userId }),

  // ==================== GOAL CRUD ====================
  createGoal: async (goalData) => {
    try {
      const newGoal = await teamflectApi.goals.create(goalData)
      set((state) => ({ goals: [...state.goals, newGoal] }))
      return newGoal
    } catch (error) {
      console.error('[Store] Error creating goal:', error)
      throw error
    }
  },

  updateGoalProgress: async (goalId, newValue, comment) => {
    try {
      await teamflectApi.goals.updateProgress({ goalId, newValue, comment })
      // Refresh goals after update
      const goals = await teamflectApi.goals.getAll()
      set({ goals })
    } catch (error) {
      console.error('[Store] Error updating goal progress:', error)
      throw error
    }
  },

  addGoalComment: async (goalId, comment) => {
    try {
      await teamflectApi.goals.addComment({ goalId, comment })
      // Refresh goals after comment
      const goals = await teamflectApi.goals.getAll()
      set({ goals })
    } catch (error) {
      console.error('[Store] Error adding goal comment:', error)
      throw error
    }
  },

  // ==================== RECOGNITION CRUD ====================
  createRecognition: async (recipientUPNorIds, message) => {
    try {
      await teamflectApi.recognitions.create({ recipientUPNorIds, message })
      // Refresh recognitions
      const recognitions = await teamflectApi.recognitions.search({})
      set({ recognitions })
    } catch (error) {
      console.error('[Store] Error creating recognition:', error)
      throw error
    }
  },

  // ==================== FEEDBACK CRUD ====================
  sendFeedbackRequest: async (data) => {
    try {
      await teamflectApi.feedback.sendRequest(data)
      // Refresh feedback
      const feedback = await teamflectApi.feedback.getAll()
      set({ feedback })
    } catch (error) {
      console.error('[Store] Error sending feedback request:', error)
      throw error
    }
  },
}))
