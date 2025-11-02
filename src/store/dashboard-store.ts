import { create } from 'zustand'
import { User, Task, Goal, Recognition, teamflectApi, mockData } from '@/lib/teamflect-api'

interface DashboardState {
  // Data
  users: User[]
  tasks: Task[]
  goals: Goal[]
  recognitions: Recognition[]

  // UI State
  isLoading: boolean
  error: string | null
  selectedView: 'overview' | 'tasks' | 'goals' | 'team'
  selectedUserId: string | null
  useMockData: boolean

  // Actions
  fetchAllData: () => Promise<void>
  setSelectedView: (view: 'overview' | 'tasks' | 'goals' | 'team') => void
  setSelectedUser: (userId: string | null) => void
  createTask: (task: Partial<Task>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  toggleMockData: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  users: mockData.users,
  tasks: mockData.tasks,
  goals: mockData.goals,
  recognitions: mockData.recognitions,
  isLoading: false,
  error: null,
  selectedView: 'overview',
  selectedUserId: null,
  useMockData: true, // Start with mock data for development

  // Fetch all data
  fetchAllData: async () => {
    const { useMockData } = get()

    if (useMockData) {
      // Use mock data
      set({
        users: mockData.users,
        tasks: mockData.tasks,
        goals: mockData.goals,
        recognitions: mockData.recognitions,
        isLoading: false,
        error: null,
      })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const [users, tasks, goals, recognitions] = await Promise.all([
        teamflectApi.getUsers().catch(() => mockData.users),
        teamflectApi.getTasks().catch(() => mockData.tasks),
        teamflectApi.getGoals().catch(() => mockData.goals),
        teamflectApi.getRecognitions().catch(() => mockData.recognitions),
      ])

      set({
        users,
        tasks,
        goals,
        recognitions,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      set({
        error: 'Failed to load dashboard data. Using mock data.',
        isLoading: false,
        users: mockData.users,
        tasks: mockData.tasks,
        goals: mockData.goals,
        recognitions: mockData.recognitions,
      })
    }
  },

  setSelectedView: (view) => set({ selectedView: view }),

  setSelectedUser: (userId) => set({ selectedUserId: userId }),

  createTask: async (task) => {
    const { useMockData, tasks } = get()

    if (useMockData) {
      // Mock creation
      const newTask: Task = {
        id: String(Date.now()),
        title: task.title || '',
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assigneeId: task.assigneeId || '',
        assignerId: task.assignerId || '',
        dueDate: task.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set({ tasks: [...tasks, newTask] })
      return
    }

    try {
      const newTask = await teamflectApi.createTask(task)
      set({ tasks: [...tasks, newTask] })
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  updateTask: async (taskId, updates) => {
    const { useMockData, tasks } = get()

    if (useMockData) {
      // Mock update
      set({
        tasks: tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      })
      return
    }

    try {
      const updatedTask = await teamflectApi.updateTask(taskId, updates)
      set({
        tasks: tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      })
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  toggleMockData: () => {
    set((state) => ({ useMockData: !state.useMockData }))
    get().fetchAllData()
  },
}))
