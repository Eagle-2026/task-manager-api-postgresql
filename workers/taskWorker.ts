import { Worker, type Job } from "bullmq";

import redisConnection = require("../config/redis");

import logger = require("../utils/logger");

// ========================================
// JOB DATA TYPE
// ========================================

interface TaskNotificationJobData {
  taskId: string;
  userId: string;
  title: string;
}

// ========================================
// TASK WORKER
// ========================================

const taskWorker = new Worker<TaskNotificationJobData>(
  "task-notifications",

  async (job: Job<TaskNotificationJobData>) => {
    logger.info(
      {
        jobId: job.id,
        jobName: job.name,
        taskId: job.data.taskId,
      },
      "Background job started",
    );

    // Pretend notification takes 3 seconds
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 3000);
    });

    logger.info(
      {
        jobId: job.id,
        taskId: job.data.taskId,
        title: job.data.title,
      },
      "Task notification processed",
    );

    return {
      success: true,
    };
  },

  {
    connection: redisConnection,
  },
);

// ========================================
// COMPLETED EVENT
// ========================================

taskWorker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
    },
    "Background job completed",
  );
});

// ========================================
// FAILED EVENT
// ========================================

taskWorker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      err: error,
    },
    "Background job failed",
  );
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const shutdown = async (): Promise<void> => {
  logger.info("Closing task worker");

  await taskWorker.close();

  process.exit(0);
};

process.on("SIGTERM", shutdown);

process.on("SIGINT", shutdown);

export = taskWorker;
