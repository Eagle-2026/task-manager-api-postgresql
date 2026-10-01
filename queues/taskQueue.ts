import {
  Queue,
} from "bullmq";

import redisConnection = require(
  "../config/redis"
);

// ========================================
// TASK QUEUE
// ========================================

const taskQueue = new Queue(
  "task-notifications",
  {
    connection: redisConnection,
  },
);

export = taskQueue;