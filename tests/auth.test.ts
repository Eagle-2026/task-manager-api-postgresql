// ========================================
// TEST ENVIRONMENT
// ========================================

process.env.NODE_ENV = "test";

// Load .env first.
require("dotenv").config();

// IMPORTANT:
// Never allow tests to use the normal development database.
//
// Add this to .env:
//
// TEST_DB_NAME=postgres_practice_test
//
if (!process.env.TEST_DB_NAME) {
  throw new Error(
    "TEST_DB_NAME is missing. Create a separate PostgreSQL test database.",
  );
}

process.env.DB_NAME = process.env.TEST_DB_NAME;

if (
  !process.env.DB_NAME.toLowerCase().includes("test")
) {
  throw new Error(
    "Tests must use a PostgreSQL database containing 'test' in its name.",
  );
}

// ========================================
// MOCK REDIS / BULLMQ QUEUE
// ========================================

// During Jest tests we do not want to
// connect to a real Redis server.

jest.mock("../queues/taskQueue", () => ({
  add: jest.fn().mockResolvedValue({
    id: "test-job",
  }),
}));

// ========================================
// IMPORTS
// ========================================

const request = require("supertest");

// db.ts exports PostgreSQL pool as default.
const pool =
  require("../config/db").default;

// Import Express app.
// Do not import server.ts because tests
// do not need app.listen().
const app = require("../app");

// ========================================
// HELPER — CLEAN TEST DATABASE
// ========================================

const clearDatabase = async () => {
  // sessions and tasks reference users.
  // CASCADE handles the FK relationships.
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
// HELPER — GET COOKIE
// ========================================

const getCookie = (
  response: {
    headers: {
      "set-cookie"?: string[];
    };
  },
  cookieName: string,
) => {
  const cookies =
    response.headers["set-cookie"] || [];

  const cookie = cookies.find(
    (item) =>
      item.startsWith(`${cookieName}=`),
  );

  return cookie
    ? cookie.split(";")[0]
    : null;
};

// ========================================
// BEFORE ALL TESTS
// ========================================

beforeAll(async () => {
  // Verify PostgreSQL test connection.
  await pool.query("SELECT 1");
});

// ========================================
// BEFORE EVERY TEST
// ========================================

beforeEach(async () => {
  await clearDatabase();
});

// ========================================
// AFTER ALL TESTS
// ========================================

afterAll(async () => {
  await clearDatabase();

  // Close PostgreSQL pool so Jest can exit.
  await pool.end();
});

// ========================================
// AUTH TESTS
// ========================================

describe("Authentication API", () => {
  // ======================================
  // 1. SIGNUP
  // ======================================

  test(
    "POST /api/v1/auth/signup creates a user",
    async () => {
      const newUser = {
        name: "John Test",
        email: "john@test.com",
        password: "password123",
      };

      const response =
        await request(app)
          .post(
            "/api/v1/auth/signup",
          )
          .send(newUser);

      expect(
        response.statusCode,
      ).toBe(201);

      expect(
        response.body.status,
      ).toBe("success");

      expect(
        response.body.data.user,
      ).toBeDefined();

      expect(
        response.body.data.user.email,
      ).toBe("john@test.com");

      // Password must never be returned.
      expect(
        response.body.data.user
          .password,
      ).toBeUndefined();

      const accessCookie =
        getCookie(
          response,
          "accessToken",
        );

      const refreshCookie =
        getCookie(
          response,
          "refreshToken",
        );

      expect(
        accessCookie,
      ).not.toBeNull();

      expect(
        refreshCookie,
      ).not.toBeNull();

      // ==================================
      // VERIFY USER IN POSTGRESQL
      // ==================================

      const userResult =
        await pool.query(
          `
            SELECT
              id,
              name,
              email,
              role
            FROM users
            WHERE email = $1
          `,
          ["john@test.com"],
        );

      expect(
        userResult.rows[0],
      ).toBeDefined();

      expect(
        userResult.rows[0].email,
      ).toBe("john@test.com");

      // Signup should also create
      // a refresh session.
      const sessionResult =
        await pool.query(
          `
            SELECT
              id,
              user_id,
              refresh_token_hash,
              expires_at,
              revoked
            FROM sessions
          `,
        );

      expect(
        sessionResult.rows,
      ).toHaveLength(1);
    },
  );

  // ======================================
  // 2. SIGNUP VALIDATION
  // ======================================

  test(
    "POST /api/v1/auth/signup rejects invalid email",
    async () => {
      const response =
        await request(app)
          .post(
            "/api/v1/auth/signup",
          )
          .send({
            name: "John Test",
            email: "wrong-email",
            password: "password123",
          });

      expect(
        response.statusCode,
      ).toBe(400);

      expect(
        response.body.status,
      ).toBe("fail");

      expect(
        response.body.message,
      ).toBe(
        "Validation failed",
      );

      expect(
        response.body.errors,
      ).toBeDefined();
    },
  );

  // ======================================
  // 3. LOGIN SUCCESS
  // ======================================

  test(
    "POST /api/v1/auth/login logs in with correct credentials",
    async () => {
      await request(app)
        .post(
          "/api/v1/auth/signup",
        )
        .send({
          name: "John Test",
          email: "john@test.com",
          password: "password123",
        });

      const response =
        await request(app)
          .post(
            "/api/v1/auth/login",
          )
          .send({
            email: "john@test.com",
            password: "password123",
          });

      expect(
        response.statusCode,
      ).toBe(200);

      expect(
        response.body.status,
      ).toBe("success");

      expect(
        response.body.data.user
          .email,
      ).toBe("john@test.com");

      expect(
        response.body.data.user
          .password,
      ).toBeUndefined();

      expect(
        getCookie(
          response,
          "accessToken",
        ),
      ).not.toBeNull();

      expect(
        getCookie(
          response,
          "refreshToken",
        ),
      ).not.toBeNull();
    },
  );

  // ======================================
  // 4. WRONG PASSWORD
  // ======================================

  test(
    "POST /api/v1/auth/login rejects wrong password",
    async () => {
      await request(app)
        .post(
          "/api/v1/auth/signup",
        )
        .send({
          name: "John Test",
          email: "john@test.com",
          password: "password123",
        });

      const response =
        await request(app)
          .post(
            "/api/v1/auth/login",
          )
          .send({
            email: "john@test.com",
            password:
              "wrong-password",
          });

      expect(
        response.statusCode,
      ).toBe(401);

      expect(
        response.body.status,
      ).toBe("fail");

      expect(
        response.body.message,
      ).toBe(
        "Incorrect email or password",
      );
    },
  );

  // ======================================
  // 5. PROTECTED ROUTE WITHOUT LOGIN
  // ======================================

  test(
    "GET /api/v1/tasks rejects user without access token",
    async () => {
      const response =
        await request(app).get(
          "/api/v1/tasks",
        );

      expect(
        response.statusCode,
      ).toBe(401);

      expect(
        response.body.status,
      ).toBe("fail");

      expect(
        response.body.message,
      ).toBe(
        "You are not logged in",
      );
    },
  );

  // ======================================
  // 6. REFRESH TOKEN ROTATION
  // ======================================

  test(
    "POST /api/v1/auth/refresh rotates the refresh token",
    async () => {
      const signupResponse =
        await request(app)
          .post(
            "/api/v1/auth/signup",
          )
          .send({
            name: "John Test",
            email: "john@test.com",
            password:
              "password123",
          });

      const oldRefreshCookie =
        getCookie(
          signupResponse,
          "refreshToken",
        );

      expect(
        oldRefreshCookie,
      ).not.toBeNull();

      const refreshResponse =
        await request(app)
          .post(
            "/api/v1/auth/refresh",
          )
          .set(
            "Cookie",
            oldRefreshCookie,
          );

      expect(
        refreshResponse.statusCode,
      ).toBe(200);

      expect(
        refreshResponse.body.status,
      ).toBe("success");

      expect(
        refreshResponse.body.message,
      ).toBe(
        "Tokens refreshed successfully",
      );

      const newAccessCookie =
        getCookie(
          refreshResponse,
          "accessToken",
        );

      const newRefreshCookie =
        getCookie(
          refreshResponse,
          "refreshToken",
        );

      expect(
        newAccessCookie,
      ).not.toBeNull();

      expect(
        newRefreshCookie,
      ).not.toBeNull();

      expect(
        newRefreshCookie,
      ).not.toBe(
        oldRefreshCookie,
      );

      // Verify session still exists
      // after token rotation.
      const sessionResult =
        await pool.query(
          `
            SELECT
              id,
              user_id,
              refresh_token_hash,
              expires_at,
              revoked
            FROM sessions
            WHERE revoked = false
          `,
        );

      expect(
        sessionResult.rows,
      ).toHaveLength(1);

      // Try using OLD token again.
      const reuseOldTokenResponse =
        await request(app)
          .post(
            "/api/v1/auth/refresh",
          )
          .set(
            "Cookie",
            oldRefreshCookie,
          );

      expect(
        reuseOldTokenResponse
          .statusCode,
      ).toBe(401);

      expect(
        reuseOldTokenResponse
          .body.message,
      ).toBe(
        "Invalid refresh session",
      );
    },
  );

  // ======================================
  // 7. REFRESH WITHOUT TOKEN
  // ======================================

  test(
    "POST /api/v1/auth/refresh rejects request without refresh token",
    async () => {
      const response =
        await request(app).post(
          "/api/v1/auth/refresh",
        );

      expect(
        response.statusCode,
      ).toBe(401);

      expect(
        response.body.message,
      ).toBe(
        "Refresh token not found",
      );
    },
  );

  // ======================================
  // 8. LOGOUT
  // ======================================

  test(
    "POST /api/v1/auth/logout removes authentication",
    async () => {
      const agent =
        request.agent(app);

      await agent
        .post(
          "/api/v1/auth/signup",
        )
        .send({
          name: "John Test",
          email: "john@test.com",
          password: "password123",
        });

      const beforeLogout =
        await agent.get(
          "/api/v1/tasks",
        );

      expect(
        beforeLogout.statusCode,
      ).toBe(200);

      const logoutResponse =
        await agent.post(
          "/api/v1/auth/logout",
        );

      expect(
        logoutResponse.statusCode,
      ).toBe(200);

      expect(
        logoutResponse.body.message,
      ).toBe(
        "Logged out successfully",
      );

      const afterLogout =
        await agent.get(
          "/api/v1/tasks",
        );

      expect(
        afterLogout.statusCode,
      ).toBe(401);

      // Verify PostgreSQL session
      // was revoked after logout.
      const activeSessions =
        await pool.query(
          `
            SELECT id
            FROM sessions
            WHERE revoked = false
          `,
        );

      expect(
        activeSessions.rows,
      ).toHaveLength(0);
    },
  );
});