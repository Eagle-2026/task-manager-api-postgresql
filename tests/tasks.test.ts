// ========================================
// TEST ENVIRONMENT
// ========================================

process.env.NODE_ENV = "test";

require("dotenv").config();

if (!process.env.TEST_DB_NAME) {
  throw new Error(
    "TEST_DB_NAME is missing. Create a separate PostgreSQL test database.",
  );
}

process.env.DB_NAME =
  process.env.TEST_DB_NAME;

if (
  !process.env.DB_NAME
    .toLowerCase()
    .includes("test")
) {
  throw new Error(
    "Tests must use a PostgreSQL database containing 'test' in its name.",
  );
}

// ========================================
// MOCK REDIS / BULLMQ QUEUE
// ========================================

jest.mock("../queues/taskQueue", () => ({
  add: jest.fn().mockResolvedValue({
    id: "test-job",
  }),
}));

// ========================================
// IMPORTS
// ========================================

const request =
  require("supertest");

const pool =
  require("../config/db").default;

const app =
  require("../app");

// ========================================
// CLEAN DATABASE
// ========================================

const clearDatabase = async () => {
  await pool.query(`
    TRUNCATE TABLE
      sessions,
      tasks,
      users
    RESTART IDENTITY
    CASCADE
  `);
};

// ========================================
// CREATE LOGGED-IN USER
// ========================================

const createLoggedInUser = async (
  name: string,
  email: string,
) => {
  const agent =
    request.agent(app);

  const response =
    await agent
      .post(
        "/api/v1/auth/signup",
      )
      .send({
        name,
        email,
        password:
          "password123",
      });

  expect(
    response.statusCode,
  ).toBe(201);

  return {
    agent,
    user:
      response.body.data.user,
  };
};

// ========================================
// DATABASE SETUP
// ========================================

beforeAll(async () => {
  await pool.query("SELECT 1");
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await clearDatabase();

  await pool.end();
});

// ========================================
// TASK TESTS
// ========================================

describe("Tasks API", () => {
  // ======================================
  // 1. AUTHENTICATION
  // ======================================

  test(
    "GET /api/v1/tasks rejects unauthenticated user",
    async () => {
      const response =
        await request(app).get(
          "/api/v1/tasks",
        );

      expect(
        response.statusCode,
      ).toBe(401);

      expect(
        response.body.message,
      ).toBe(
        "You are not logged in",
      );
    },
  );

  // ======================================
  // 2. CREATE TASK
  // ======================================

  test(
    "POST /api/v1/tasks creates a task for logged-in user",
    async () => {
      const {
        agent,
        user,
      } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const response =
        await agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Learn Jest",
            description:
              "Practice Supertest",
            completed:
              false,
          });

      expect(
        response.statusCode,
      ).toBe(201);

      expect(
        response.body.status,
      ).toBe("success");

      expect(
        response.body.data.task,
      ).toBeDefined();

      expect(
        response.body.data.task
          .title,
      ).toBe("Learn Jest");

      expect(
        response.body.data.task
          .description,
      ).toBe(
        "Practice Supertest",
      );

      expect(
        response.body.data.task
          .completed,
      ).toBe(false);

      expect(
        response.body.data.task
          .user_id,
      ).toBe(user.id);
    },
  );

  // ======================================
  // 3. VALIDATION
  // ======================================

  test(
    "POST /api/v1/tasks rejects empty title",
    async () => {
      const { agent } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const response =
        await agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title: "   ",
          });

      expect(
        response.statusCode,
      ).toBe(400);

      expect(
        response.body.message,
      ).toBe(
        "Validation failed",
      );
    },
  );

  // ======================================
  // 4. MASS-ASSIGNMENT / STRICT VALIDATION
  // ======================================

  test(
    "POST /api/v1/tasks rejects user field supplied by client",
    async () => {
      const { agent } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const response =
        await agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Bad Task",

            // Client tries to
            // choose owner manually.
            user: 999,
          });

      expect(
        response.statusCode,
      ).toBe(400);

      expect(
        response.body.message,
      ).toBe(
        "Validation failed",
      );
    },
  );

  // ======================================
  // 5. GET ONLY OWN TASKS
  // ======================================

  test(
    "GET /api/v1/tasks returns only normal user's tasks",
    async () => {
      const userA =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const userB =
        await createLoggedInUser(
          "User B",
          "userb@test.com",
        );

      await userA.agent
        .post(
          "/api/v1/tasks",
        )
        .send({
          title:
            "User A Task",
        });

      await userB.agent
        .post(
          "/api/v1/tasks",
        )
        .send({
          title:
            "User B Task",
        });

      const response =
        await userA.agent.get(
          "/api/v1/tasks",
        );

      expect(
        response.statusCode,
      ).toBe(200);

      expect(
        response.body.data.tasks,
      ).toHaveLength(1);

      expect(
        response.body.data.tasks[0]
          .title,
      ).toBe("User A Task");

      expect(
        response.body.data.tasks[0]
          .user_id,
      ).toBe(
        userA.user.id,
      );
    },
  );

  // ======================================
  // 6. GET OWN TASK BY ID
  // ======================================

  test(
    "GET /api/v1/tasks/:id returns user's own task",
    async () => {
      const { agent } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const createResponse =
        await agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "My Private Task",
          });

      const taskId =
        createResponse.body.data.task
          .id;

      const response =
        await agent.get(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        response.statusCode,
      ).toBe(200);

      expect(
        response.body.data.task
          .title,
      ).toBe(
        "My Private Task",
      );
    },
  );

  // ======================================
  // 7. CANNOT READ ANOTHER USER'S TASK
  // ======================================

  test(
    "User B cannot read User A's task",
    async () => {
      const userA =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const userB =
        await createLoggedInUser(
          "User B",
          "userb@test.com",
        );

      const createResponse =
        await userA.agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "User A Secret Task",
          });

      const taskId =
        createResponse.body.data.task
          .id;

      const response =
        await userB.agent.get(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        response.statusCode,
      ).toBe(404);

      expect(
        response.body.message,
      ).toBe(
        "Task not found",
      );
    },
  );

  // ======================================
  // 8. UPDATE OWN TASK
  // ======================================

  test(
    "PATCH /api/v1/tasks/:id updates user's own task",
    async () => {
      const { agent } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const createResponse =
        await agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Old Title",
            completed:
              false,
          });

      const taskId =
        createResponse.body.data.task
          .id;

      const response =
        await agent
          .patch(
            `/api/v1/tasks/${taskId}`,
          )
          .send({
            title:
              "New Title",
            completed:
              true,
          });

      expect(
        response.statusCode,
      ).toBe(200);

      expect(
        response.body.data.task
          .title,
      ).toBe("New Title");

      expect(
        response.body.data.task
          .completed,
      ).toBe(true);
    },
  );

  // ======================================
  // 9. ACCESS CONTROL TEST
  // ======================================

  test(
    "User B cannot update User A's task",
    async () => {
      const userA =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const userB =
        await createLoggedInUser(
          "User B",
          "userb@test.com",
        );

      const createResponse =
        await userA.agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Original Private Task",
          });

      const taskId =
        createResponse.body.data.task
          .id;

      const attackResponse =
        await userB.agent
          .patch(
            `/api/v1/tasks/${taskId}`,
          )
          .send({
            title: "HACKED",
          });

      expect(
        attackResponse.statusCode,
      ).toBe(404);

      const verifyResponse =
        await userA.agent.get(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        verifyResponse.body.data.task
          .title,
      ).toBe(
        "Original Private Task",
      );
    },
  );

  // ======================================
  // 10. CANNOT DELETE ANOTHER USER'S TASK
  // ======================================

  test(
    "User B cannot delete User A's task",
    async () => {
      const userA =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const userB =
        await createLoggedInUser(
          "User B",
          "userb@test.com",
        );

      const createResponse =
        await userA.agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Do Not Delete",
          });

      const taskId =
        createResponse.body.data.task
          .id;

      const attackResponse =
        await userB.agent.delete(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        attackResponse.statusCode,
      ).toBe(404);

      const verifyResponse =
        await userA.agent.get(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        verifyResponse.statusCode,
      ).toBe(200);

      expect(
        verifyResponse.body.data.task
          .title,
      ).toBe(
        "Do Not Delete",
      );
    },
  );

  // ======================================
  // 11. DELETE OWN TASK
  // ======================================

  test(
    "DELETE /api/v1/tasks/:id deletes user's own task",
    async () => {
      const { agent } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      const createResponse =
        await agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Delete This Task",
          });

      const taskId =
        createResponse.body.data.task
          .id;

      const deleteResponse =
        await agent.delete(
          `/api/v1/tasks/${taskId}`,
        );

     expect(deleteResponse.statusCode).toBe(200);

      const getResponse =
        await agent.get(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        getResponse.statusCode,
      ).toBe(404);
    },
  );

  // ======================================
  // 12. TASK NOT FOUND
  // ======================================

  test(
    "GET /api/v1/tasks/:id returns 404 for missing task",
    async () => {
      const { agent } =
        await createLoggedInUser(
          "User A",
          "usera@test.com",
        );

      // Valid PostgreSQL integer ID,
      // but no task exists.
      const fakeTaskId = 999999;

      const response =
        await agent.get(
          `/api/v1/tasks/${fakeTaskId}`,
        );

      expect(
        response.statusCode,
      ).toBe(404);

      expect(
        response.body.message,
      ).toBe(
        "Task not found",
      );
    },
  );

  // ======================================
  // 13. ADMIN CAN ACCESS OTHER USER'S TASK
  // ======================================

  test(
    "Admin can access another user's task",
    async () => {
      const normalUser =
        await createLoggedInUser(
          "Normal User",
          "normal@test.com",
        );

      const taskResponse =
        await normalUser.agent
          .post(
            "/api/v1/tasks",
          )
          .send({
            title:
              "Normal User Task",
          });

      const taskId =
        taskResponse.body.data.task
          .id;

      const admin =
        await createLoggedInUser(
          "Admin User",
          "admin@test.com",
        );

      // Change role directly
      // in PostgreSQL.
      await pool.query(
        `
          UPDATE users
          SET role = 'admin'
          WHERE id = $1
        `,
        [admin.user.id],
      );

      // protect() reloads user from
      // PostgreSQL, so it sees admin role.
      const response =
        await admin.agent.get(
          `/api/v1/tasks/${taskId}`,
        );

      expect(
        response.statusCode,
      ).toBe(200);

      expect(
        response.body.data.task
          .title,
      ).toBe(
        "Normal User Task",
      );
    },
  );
});