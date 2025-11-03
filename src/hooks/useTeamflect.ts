import { trpc } from '@/lib/trpc';

// Goals Hooks - Now using tRPC
export const useGoals = (params?: { limit?: number; offset?: number; status?: string; ownerId?: string }) => {
  return trpc.goals.getAll.useQuery(params);
};

export const useCreateGoal = () => {
  const utils = trpc.useContext();
  return trpc.goals.create.useMutation({
    onSuccess: () => {
      utils.goals.getAll.invalidate();
    },
  });
};

export const useUpdateGoal = () => {
  const utils = trpc.useContext();
  return trpc.goals.updateProgress.useMutation({
    onSuccess: () => {
      utils.goals.getAll.invalidate();
    },
  });
};

export const useDeleteGoal = () => {
  const utils = trpc.useContext();
  return trpc.goals.delete.useMutation({
    onSuccess: () => {
      utils.goals.getAll.invalidate();
    },
  });
};

// Tasks Hooks - Now using tRPC
export const useTasks = (params?: { limit?: number; offset?: number; status?: string }) => {
  return trpc.tasks.getAll.useQuery(params);
};

export const useCreateTask = () => {
  const utils = trpc.useContext();
  return trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });
};

export const useUpdateTask = () => {
  const utils = trpc.useContext();
  return trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });
};

export const useDeleteTask = () => {
  const utils = trpc.useContext();
  return trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate();
    },
  });
};

// Feedback Hooks - Now using tRPC
export const useFeedback = (params?: { limit?: number; offset?: number }) => {
  return trpc.feedback.getAll.useQuery(params);
};

export const useSendFeedback = () => {
  const utils = trpc.useContext();
  return trpc.feedback.send.useMutation({
    onSuccess: () => {
      utils.feedback.getAll.invalidate();
    },
  });
};

// Recognition Hooks - Now using tRPC
export const useRecognitions = (params?: { limit?: number; offset?: number }) => {
  return trpc.recognitions.getAll.useQuery(params);
};

export const useCreateRecognition = () => {
  const utils = trpc.useContext();
  return trpc.recognitions.create.useMutation({
    onSuccess: () => {
      utils.recognitions.getAll.invalidate();
    },
  });
};

export const useLikeRecognition = () => {
  const utils = trpc.useContext();
  return trpc.recognitions.like.useMutation({
    onSuccess: () => {
      utils.recognitions.getAll.invalidate();
    },
  });
};

// Users Hooks - Now using tRPC
export const useUsers = (params?: { limit?: number; offset?: number }) => {
  return trpc.users.getAll.useQuery(params);
};

// Reviews Hooks - Now using tRPC
export const useReviews = (params?: { limit?: number; offset?: number }) => {
  return trpc.reviews.getAll.useQuery(params);
};
