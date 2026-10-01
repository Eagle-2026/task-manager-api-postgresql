import * as taskRepository from "../repositories/taskRepository";

import AppError = require("../utils/appError");

import taskQueue = require("../queues/taskQueue");

import type { UserType } from "../types/user.types";

import type { TaskQuery } from "../types/task.types";

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "../validators/taskValidators";

// ========================================
// BUILD USER FILTER
// ========================================



// ========================================
// GET ALL TASKS
// ========================================
export const getTasks = async (
  user: UserType,
  query: TaskQuery,
) => {
  const page =
    Number(query.page) || 1;

  const limit =
    Number(query.limit) || 100;

  const offset =
    (page - 1) * limit;

  const userId = user.id;

  const isAdmin =
    user.role === "admin";

  let completed:
    boolean | undefined;

  if (query.completed === "true") {
    completed = true;
  }

  if (query.completed === "false") {
    completed = false;
  }

  const search = query.search;

  const sort =
    query.sort || "newest";

  const totalTasks =
    await taskRepository.countTasks({
      userId,
      isAdmin,
      completed,
      search,
    });

  const totalPages =
    Math.ceil(
      totalTasks / limit,
    );

  if (
    page > totalPages &&
    totalPages > 0
  ) {
    throw new AppError(
      "This page does not exist",
      404,
    );
  }

  const tasks =
    await taskRepository.findTasks({
      userId,
      isAdmin,
      completed,
      search,
      sort,
      limit,
      offset,
    });

  return {
    tasks,

    pagination: {
      currentPage: page,
      limit,
      totalTasks,
      totalPages,
    },
  };
};

// ========================================
// CREATE TASK
// ========================================

export const createTask = async (
  user: UserType,
  taskData: CreateTaskInput,
) => {
  const task =
    await taskRepository.createTask({
      ...taskData,
      user_id: user.id,
    });

  await taskQueue.add(
    "task-created-notification",
    {
      taskId: String(task.id),
      userId: String(user.id),
      title: task.title,
    },
    {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 10000,
      },
    },
  );

  return task;
};

// ========================================
// GET TASK BY ID
// ========================================

export const getTask = async (
  user: UserType,
  id: string,
) => {
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    throw new AppError(
      "Invalid task ID",
      400,
    );
  }

  const task =
    await taskRepository.findTaskById(
      taskId,
      user.id,
      user.role === "admin",
    );

  if (!task) {
    throw new AppError(
      "Task not found",
      404,
    );
  }

  return task;
};
// ========================================
// UPDATE TASK
// ========================================
export const updateTask = async (
  user: UserType,
  id: string,
  updateData: UpdateTaskInput,
) => {
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    throw new AppError(
      "Invalid task ID",
      400,
    );
  }

  const task =
    await taskRepository.updateTask(
      taskId,
      user.id,
      user.role === "admin",
      updateData,
    );

  if (!task) {
    throw new AppError(
      "Task not found",
      404,
    );
  }

  return task;
};


// ========================================
// DELETE TASK
// ========================================
export const deleteTask = async (
  user: UserType,
  id: string,
) => {
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    throw new AppError(
      "Invalid task ID",
      400,
    );
  }

  const task =
    await taskRepository.deleteTask(
      taskId,
      user.id,
      user.role === "admin",
    );

  if (!task) {
    throw new AppError(
      "Task not found",
      404,
    );
  }

  return task;
};
