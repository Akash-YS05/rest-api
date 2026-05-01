import { prisma } from "@/server/lib/prisma";
import { AppError } from "@/server/lib/error";
import { getRedis } from "@/server/lib/redis";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type ListInput = {
  userId: string;
  role: "USER" | "ADMIN";
  status?: TaskStatus;
};

type CreateInput = {
  userId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
};

type UpdateInput = {
  taskId: string;
  userId: string;
  role: "USER" | "ADMIN";
  title?: string;
  description?: string;
  status?: TaskStatus;
};

type DeleteInput = {
  taskId: string;
  userId: string;
  role: "USER" | "ADMIN";
};

const cacheKey = (role: "USER" | "ADMIN", userId: string, status?: TaskStatus): string => {
  return `tasks:${role}:${userId}:${status ?? "all"}`;
};

const invalidateTaskCache = async (userId: string): Promise<void> => {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  const userKeys = await redis.keys(`tasks:USER:${userId}:*`);
  const adminKeys = await redis.keys("tasks:ADMIN:*:*");
  const keys = [...userKeys, ...adminKeys];

  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

export const listTasks = async (input: ListInput) => {
  const redis = getRedis();
  const key = cacheKey(input.role, input.userId, input.status);

  if (redis) {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const tasks = await prisma.task.findMany({
    where:
      input.role === "ADMIN"
        ? {
            status: input.status,
          }
        : {
            ownerId: input.userId,
            status: input.status,
          },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (redis) {
    await redis.set(key, JSON.stringify(tasks), "EX", 45);
  }

  return tasks;
};

export const createTask = async (input: CreateInput) => {
  const created = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      ownerId: input.userId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await invalidateTaskCache(input.userId);
  return created;
};

export const updateTask = async (input: UpdateInput) => {
  const existing = await prisma.task.findUnique({
    where: { id: input.taskId },
  });

  if (!existing) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
  }

  if (input.role !== "ADMIN" && existing.ownerId !== input.userId) {
    throw new AppError(403, "FORBIDDEN", "Cannot update other user's task");
  }

  const updated = await prisma.task.update({
    where: { id: input.taskId },
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await invalidateTaskCache(updated.ownerId);
  return updated;
};

export const deleteTask = async (input: DeleteInput) => {
  const existing = await prisma.task.findUnique({
    where: { id: input.taskId },
  });

  if (!existing) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
  }

  if (input.role !== "ADMIN" && existing.ownerId !== input.userId) {
    throw new AppError(403, "FORBIDDEN", "Cannot delete other user's task");
  }

  await prisma.task.delete({
    where: { id: input.taskId },
  });

  await invalidateTaskCache(existing.ownerId);
};
