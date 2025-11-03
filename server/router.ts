import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { teamflectAPI } from './teamflect';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // Goals procedures
  goals: t.router({
    getAll: t.procedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        status: z.string().optional(),
        ownerId: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return teamflectAPI.getGoals(input);
      }),

    create: t.procedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        startDate: z.string(),
        dueDate: z.string(),
        ownerIds: z.array(z.string()),
        status: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.createGoal(input);
      }),

    updateProgress: t.procedure
      .input(z.object({
        goalId: z.string(),
        progress: z.number(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.updateGoalProgress(input.goalId, input.progress);
      }),

    delete: t.procedure
      .input(z.object({
        goalId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.deleteGoal(input.goalId);
      }),
  }),

  // Tasks procedures
  tasks: t.router({
    getAll: t.procedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return teamflectAPI.getTasks(input);
      }),

    create: t.procedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        assigneeIds: z.array(z.string()),
        dueDate: z.string(),
        priority: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.createTask(input);
      }),

    update: t.procedure
      .input(z.object({
        taskId: z.string(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.updateTask(input.taskId, input.data);
      }),

    delete: t.procedure
      .input(z.object({
        taskId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.deleteTask(input.taskId);
      }),
  }),

  // Feedback procedures
  feedback: t.router({
    getAll: t.procedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return teamflectAPI.getFeedback(input);
      }),

    send: t.procedure
      .input(z.object({
        recipientId: z.string(),
        message: z.string(),
        type: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.sendFeedback(input);
      }),
  }),

  // Recognitions procedures
  recognitions: t.router({
    getAll: t.procedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return teamflectAPI.getRecognitions(input);
      }),

    create: t.procedure
      .input(z.object({
        recipientId: z.string(),
        message: z.string(),
        type: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.createRecognition(input);
      }),

    like: t.procedure
      .input(z.object({
        recognitionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return teamflectAPI.likeRecognition(input.recognitionId);
      }),
  }),

  // Users procedures
  users: t.router({
    getAll: t.procedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return teamflectAPI.getUsers(input);
      }),
  }),

  // Reviews procedures
  reviews: t.router({
    getAll: t.procedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return teamflectAPI.getReviews(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
