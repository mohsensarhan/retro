import { create } from 'zustand'
import { User, Task, Goal, Recognition, Feedback, OneOnOne, teamflectApi, TeamflectApiError } from '@/lib/teamflect-api'

interface DashboardState {
  // Data - REAL API ONLY
  users: User[]
  tasks: Task[]
  goals: Goal[]
  recognitions: Recognition[]
  feedback: Feedback[]
  oneOnOnes: OneOnOne[]

  // UI State
  isLoading: boolean
  error: string | null
  selectedView: 'overview' | 'tasks' | 'goals' | 'team' | 'recognitions'
  selectedUserId: string | null

  // Actions - Full CRUD
  fetchAllData: () => Promise<void>
  refreshData: () => Promise<void>

  // View management
  setSelectedView: (view: DashboardState['selectedView']) => void
  setSelectedUser: (userId: string | null) => void

  // Task CRUD
  createTask: (task: Partial<Task>) => Promise<Task>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void>
  completeTask: (taskId: string) => Promise<Task>

  // Goal CRUD
  createGoal: (goal: Partial<Goal>) => Promise<Goal>
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<Goal>
  updateGoalProgress: (goalId: string, progress: number) => Promise<Goal>
  deleteGoal: (goalId: string) => Promise<void>

  // Recognition CRUD
  createRecognition: (recognition: Partial<Recognition>) => Promise<Recognition>

  // Feedback CRUD
  createFeedback: (feedback: Partial<Feedback>) => Promise<Feedback>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state - EMPTY until API loads
  users: [],
  tasks: [],
  goals: [],
  recognitions: [],
  feedback: [],
  oneOnOnes: [],
  isLoading: false,
  error: null,
  selectedView: 'overview',
  selectedUserId: null,

  // ==================== FETCH ALL DATA ====================
  fetchAllData: async () => {
    set({ isLoading: true, error: null })

    try {
      console.log('[Store] Fetching all data from Teamflect API...')

      const [users, tasks, goals, recognitions, feedback, oneOnOnes] = await Promise.all([
        teamflectApi.users.getAll(),
        teamflectApi.tasks.getAll(),
        teamflectApi.goals.getAll(),
        teamflectApi.recognitions.getAll(),
        teamflectApi.feedback.getAll(),
        teamflectApi.oneOnOnes.getAll(),
      ])

      console.log('[Store] Data loaded successfully:', {
        users: users.length,
        tasks: tasks.length,
        goals: goals.length,
        recognitions: recognitions.length,
        feedback: feedback.length,
        oneOnOnes: oneOnOnes.length,
      })

      set({
        users,
        tasks,
        goals,
        recognitions,
        feedback,
        oneOnOnes,
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

  // ==================== TASK CRUD ====================
  createTask: async (taskData) => {
    try {
      const newTask = await teamflectApi.tasks.create(taskData as any)
      set((state) => ({ tasks: [...state.tasks, newTask] }))
      return newTask
    } catch (error) {
      console.error('[Store] Error creating task:', error)
      throw error
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const updatedTask = await teamflectApi.tasks.update(taskId, updates)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }))
      return updatedTask
    } catch (error) {
      console.error('[Store] Error updating task:', error)
      throw error
    }
  },

  deleteTask: async (taskId) => {
    try {
      await teamflectApi.tasks.delete(taskId)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }))
    } catch (error) {
      console.error('[Store] Error deleting task:', error)
      throw error
    }
  },

  completeTask: async (taskId) => {
    try {
      const updatedTask = await teamflectApi.tasks.complete(taskId)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }))
      return updatedTask
    } catch (error) {
      console.error('[Store] Error completing task:', error)
      throw error
    }
  },

  // ==================== GOAL CRUD ====================
  createGoal: async (goalData) => {
    try {
      const newGoal = await teamflectApi.goals.create(goalData as any)
      set((state) => ({ goals: [...state.goals, newGoal] }))
      return newGoal
    } catch (error) {
      console.error('[Store] Error creating goal:', error)
      throw error
    }
  },

  updateGoal: async (goalId, updates) => {
    try {
      const updatedGoal = await teamflectApi.goals.update(goalId, updates)
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
      }))
      return updatedGoal
    } catch (error) {
      console.error('[Store] Error updating goal:', error)
      throw error
    }
  },

  updateGoalProgress: async (goalId, progress) => {
    try {
      const updatedGoal = await teamflectApi.goals.updateProgress(goalId, progress)
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
      }))
      return updatedGoal
    } catch (error) {
      console.error('[Store] Error updating goal progress:', error)
      throw error
    }
  },

  deleteGoal: async (goalId) => {
    try {
      await teamflectApi.goals.delete(goalId)
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
      }))
    } catch (error) {
      console.error('[Store] Error deleting goal:', error)
      throw error
    }
  },

  // ==================== RECOGNITION CRUD ====================
  createRecognition: async (recognitionData) => {
    try {
      const newRecognition = await teamflectApi.recognitions.create(recognitionData as any)
      set((state) => ({ recognitions: [...state.recognitions, newRecognition] }))
      return newRecognition
    } catch (error) {
      console.error('[Store] Error creating recognition:', error)
      throw error
    }
  },

  // ==================== FEEDBACK CRUD ====================
  createFeedback: async (feedbackData) => {
    try {
      const newFeedback = await teamflectApi.feedback.create(feedbackData as any)
      set((state) => ({ feedback: [...state.feedback, newFeedback] }))
      return newFeedback
    } catch (error) {
      console.error('[Store] Error creating feedback:', error)
      throw error
    }
  },
}))
