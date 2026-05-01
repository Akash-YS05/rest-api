import { z } from "zod";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(400).optional(),
  status: taskStatusSchema.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(400).optional(),
  status: taskStatusSchema.optional(),
});

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
});
