import asyncHandler = require(
  "express-async-handler"
);

import type {
  Request,
  Response,
} from "express";

import * as taskService from "../services/taskService";

import type {
  TaskQuery,
} from "../types/task.types";

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "../validators/taskValidators";

// ========================================
// REQUEST TYPES
// ========================================

type TaskParams = {
  id: string;
};

type CreateTaskRequest = Request<
  {},
  {},
  CreateTaskInput
>;

type GetTasksRequest = Request<
  {},
  {},
  {},
  TaskQuery
>;

type TaskByIdRequest = Request<
  TaskParams
>;

type UpdateTaskRequest = Request<
  TaskParams,
  {},
  UpdateTaskInput
>;

// ========================================
// CREATE TASK
// ========================================

export const createTask = asyncHandler(
  async (
    req: CreateTaskRequest,
    res: Response,
  ) => {
    const task =
      await taskService.createTask(
        req.user,
        req.body,
      );

    res.status(201).json({
      status: "success",

      data: {
        task,
      },
    });
  },
);

// ========================================
// GET ALL TASKS
// ========================================

export const getAllTasks = asyncHandler(
  async (
    req: GetTasksRequest,
    res: Response,
  ) => {
    const result =
      await taskService.getTasks(
        req.user,
        req.query,
      );

    res.status(200).json({
      status: "success",

      results:
        result.tasks.length,

      pagination:
        result.pagination,

      data: {
        tasks: result.tasks,
      },
    });
  },
);

// ========================================
// GET TASK BY ID
// ========================================

export const getTaskById = asyncHandler(
  async (
    req: TaskByIdRequest,
    res: Response,
  ) => {
    const task =
      await taskService.getTask(
        req.user,
        req.params.id,
      );

    res.status(200).json({
      status: "success",

      data: {
        task,
      },
    });
  },
);

// ========================================
// UPDATE TASK
// ========================================

export const updateTask = asyncHandler(
  async (
    req: UpdateTaskRequest,
    res: Response,
  ) => {
    const task =
      await taskService.updateTask(
        req.user,
        req.params.id,
        req.body,
      );

    res.status(200).json({
      status: "success",

      data: {
        task,
      },
    });
  },
);

// ========================================
// DELETE TASK
// ========================================

export const deleteTask = asyncHandler(
  async (
    req: TaskByIdRequest,
    res: Response,
  ) => {
    await taskService.deleteTask(
      req.user,
      req.params.id,
    );

      res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
    });
  },
);