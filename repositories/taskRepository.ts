import pool from "../config/db";
import type { ITask } from "../types/task.types";

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "../validators/taskValidators";

// ========================================
// TYPES
// ========================================

interface FindTasksOptions {
  userId: number;
  isAdmin: boolean;
  completed?: boolean;
  search?: string;
  sort?: string;
  limit: number;
  offset: number;
}


type CreateTaskData = CreateTaskInput & {
   user_id: number;
};

interface CountTasksOptions {
  userId: number;
  isAdmin: boolean;
  completed?: boolean;
  search?: string;
}

// ========================================
// FIND MANY TASKS
// ========================================

export const findTasks = async ({
  userId,
  isAdmin,
  completed,
  search,
  sort = "newest",
  limit,
  offset,
}: FindTasksOptions): Promise<ITask[]> => {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (!isAdmin) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (completed !== undefined) {
    values.push(completed);
    conditions.push(`completed = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);

    conditions.push(
      `(title ILIKE $${values.length} OR description ILIKE $${values.length})`,
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  let orderBy = "created_at DESC";

  if (sort === "oldest") {
    orderBy = "created_at ASC";
  }

  if (sort === "title") {
    orderBy = "title ASC";
  }

  values.push(limit);
  const limitPosition = values.length;

  values.push(offset);
  const offsetPosition = values.length;

  const result = await pool.query<ITask>(
    `
      SELECT *
      FROM tasks
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${limitPosition}
      OFFSET $${offsetPosition}
    `,
    values,
  );

  return result.rows;
};


// ========================================
// COUNT TASKS
// ========================================

export const countTasks = async ({
  userId,
  isAdmin,
  completed,
  search,
}: CountTasksOptions): Promise<number> => {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (!isAdmin) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (completed !== undefined) {
    values.push(completed);
    conditions.push(`completed = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);

    conditions.push(
      `(title ILIKE $${values.length} OR description ILIKE $${values.length})`,
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const result = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)
      FROM tasks
      ${whereClause}
    `,
    values,
  );

  return Number(result.rows[0].count);
};

// ========================================
// FIND ONE TASK
// ========================================

export const findTaskById = async (
  taskId: number,
  userId: number,
  isAdmin: boolean,
): Promise<ITask | undefined> => {
  const result = await pool.query<ITask>(
    `
      SELECT *
      FROM tasks
      WHERE id = $1
        AND ($2 = true OR user_id = $3)
    `,
    [taskId, isAdmin, userId],
  );

  return result.rows[0];
};

// ========================================
// CREATE TASK
// ========================================

// export const createTask = async (
//   data: CreateTaskData,
// ): Promise<ITask> => {
//   const result = await pool.query<ITask>(
//     `
//       INSERT INTO tasks (
//         title,
//         description,
//         completed,
//         user_id
//       )
//       VALUES ($1, $2, $3, $4)
//       RETURNING *
//     `,
//     [
//       data.title,
//       data.description ?? null,
//       data.completed ?? false,
//       data.user_id,
//     ],
//   );

//   return result.rows[0];
// };
export const createTask = async (
  data: CreateTaskData,
): Promise<ITask> => {
  console.log(
    "### USING POSTGRES TASK REPOSITORY ###",
    data,
  );

  const result = await pool.query<ITask>(
    `
      INSERT INTO tasks (
        title,
        description,
        completed,
        user_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      data.title,
      data.description ?? null,
      data.completed ?? false,
      data.user_id,
    ],
  );

  return result.rows[0];
};
// ========================================
// UPDATE TASK
// ========================================

export const updateTask = async (
  taskId: number,
  userId: number,
  isAdmin: boolean,
  data: UpdateTaskInput,
): Promise<ITask | undefined> => {
  const result = await pool.query<ITask>(
    `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        completed = COALESCE($3, completed),
        updated_at = NOW()
      WHERE id = $4
        AND ($5 = true OR user_id = $6)
      RETURNING *
    `,
    [
      data.title ?? null,
      data.description ?? null,
      data.completed ?? null,
      taskId,
      isAdmin,
      userId,
    ],
  );

  return result.rows[0];
};

// ========================================
// DELETE TASK
// ========================================

export const deleteTask = async (
  taskId: number,
  userId: number,
  isAdmin: boolean,
): Promise<ITask | undefined> => {
  const result = await pool.query<ITask>(
    `
      DELETE FROM tasks
      WHERE id = $1
        AND ($2 = true OR user_id = $3)
      RETURNING *
    `,
    [taskId, isAdmin, userId],
  );

  return result.rows[0];
};
