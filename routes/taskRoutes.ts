import express = require("express");

import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

import { protect } from "../middleware/authMiddleware";

import validate = require(
  "../middleware/validationMiddleware"
);

import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/taskValidators";

const router = express.Router();

// ========================================
// PROTECT ALL TASK ROUTES
// ========================================

// Every route below requires the user
// to be logged in.
router.use(protect);

// ========================================
// TASK COLLECTION ROUTES
// ========================================

// GET /api/v1/tasks
// Return tasks available to the logged-in user.
//
// POST /api/v1/tasks
// Create a new task for the logged-in user.
router
  .route("/")
  .get(getAllTasks)
  .post(
    validate(createTaskSchema),
    createTask,
  );

// ========================================
// SINGLE TASK ROUTES
// ========================================

// GET /api/v1/tasks/:id
// Return one task.
//
// PATCH /api/v1/tasks/:id
// Update one task.
//
// DELETE /api/v1/tasks/:id
// Delete one task.
router
  .route("/:id")
  .get(getTaskById)
  .patch(
    validate(updateTaskSchema),
    updateTask,
  )
  .delete(deleteTask);

// ========================================
// EXPORT ROUTER
// ========================================

export = router;