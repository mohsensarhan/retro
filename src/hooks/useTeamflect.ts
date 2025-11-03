import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamflectAPI } from '@/api/teamflect';
import type {
  GetGoalsParams,
  CreateGoalRequest,
  UpdateGoalRequest,
  SendFeedbackRequest,
  CreateRecognitionRequest,
} from '@/types/teamflect';

// Goals Hooks
export function useGoals(params?: GetGoalsParams) {
  return useQuery({
    queryKey: ['goals', params],
    queryFn: () => teamflectAPI.getGoals(params),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: CreateGoalRequest) => teamflectAPI.createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: UpdateGoalRequest) => teamflectAPI.updateGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => teamflectAPI.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// Tasks Hooks
export function useTasks(params?: any) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => teamflectAPI.getTasks(params),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: any) => teamflectAPI.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: any) => teamflectAPI.updateTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Feedback Hooks
export function useFeedback(userOID?: string) {
  return useQuery({
    queryKey: ['feedback', userOID],
    queryFn: () => teamflectAPI.getFeedback(userOID),
  });
}

export function useSendFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedback: SendFeedbackRequest) => teamflectAPI.sendFeedback(feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

// Recognition Hooks
export function useRecognitions(userOID?: string) {
  return useQuery({
    queryKey: ['recognitions', userOID],
    queryFn: () => teamflectAPI.getRecognitions(userOID),
  });
}

export function useCreateRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recognition: CreateRecognitionRequest) => teamflectAPI.createRecognition(recognition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recognitions'] });
    },
  });
}

// Users Hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => teamflectAPI.getUsers(),
  });
}

// Reviews Hooks
export function useReviews(userOID?: string) {
  return useQuery({
    queryKey: ['reviews', userOID],
    queryFn: () => teamflectAPI.getReviews(userOID),
  });
}
