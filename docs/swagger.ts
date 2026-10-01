
// const swaggerJsdoc = require('swagger-jsdoc');

// const options = {
//   definition: {
//     openapi: '3.0.3',

//     info: {
//       title: 'Task Manager API',

//       version: '1.0.0',

//       description:
//         'REST API for managing users and tasks'
//     },

//     servers: [
//       {
//         url: 'http://localhost:3000/api/v1'
//       }
//     ]
//   },

//   apis: ['./routes/*.js']
// };

// const swaggerSpec = swaggerJsdoc(options);

// module.exports = swaggerSpec;

//==============
// add token jwt

// const swaggerJsdoc = require('swagger-jsdoc');

// const options = {
// definition: {
//   openapi: '3.0.3',

//   info: {
//     title: 'Task Manager API',
//     version: '1.0.0',
//     description:
//       'REST API for managing users and tasks'
//   },

//   servers: [
//     {
//       url: 'http://localhost:3000/api/v1'
//     }
//   ],

//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT'
//       }
//     }
//   }
// },

//   apis: ['./routes/*.js']
// };

// const swaggerSpec = swaggerJsdoc(options);

// module.exports = swaggerSpec;

// =========================
// Reusable Swagger definitions.
// Instead of writing the same things again and again, we define them once.

// const swaggerJsdoc = require("swagger-jsdoc");

// const options = {
//   definition: {
//     openapi: "3.0.3",

//     info: {
//       title: "Task Manager API",
//       version: "1.0.0",
//       description: "REST API for managing users and tasks",
//     },

//     servers: [
//       {
//         url: "http://localhost:3000/api/v1",
//       },
//     ],

//     components: {
//       // JWT authentication setup
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },

//       // Reusable data structures
//       schemas: {
//         Task: {
//           type: "object",

//           properties: {
//             _id: {
//               type: "string",
//             },

//             title: {
//               type: "string",
//             },

//             description: {
//               type: "string",
//             },

//             completed: {
//               type: "boolean",
//             },

//             user: {
//               type: "string",
//             },

//             createdAt: {
//               type: "string",
//               format: "date-time",
//             },

//             updatedAt: {
//               type: "string",
//               format: "date-time",
//             },
//           },
//         },
//       },
//     },
//   },

//   apis: ["./routes/*.js"],
// };

// const swaggerSpec = swaggerJsdoc(options);

// module.exports = swaggerSpec;

// ==============================
// // we u deploy project change url
// const swaggerJsdoc = require("swagger-jsdoc");

// const API_BASE_URL =
//   process.env.BACKEND_URL ||
//   "http://localhost:3000";

// const options = {
//   definition: {
//     openapi: "3.0.0",

//     info: {
//       title: "Task Manager API",
//       version: "1.0.0",
//       description: "Task Manager API documentation",
//     },

//     servers: [
//       {
//         url: `${API_BASE_URL}/api/v1`,
//       },
//     ],
//   },

//   apis: [
//     "./routes/*.js",
//     "./controllers/*.js",
//   ],
// };

// const swaggerSpec = swaggerJsdoc(options);

// module.exports = swaggerSpec;

// =================================
// usibg typescript
import swaggerJsdoc = require("swagger-jsdoc");

const API_BASE_URL =
  process.env.BACKEND_URL ||
  "http://localhost:3000";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description:
        "Task Manager API documentation",
    },

    servers: [
      {
        url: `${API_BASE_URL}/api/v1`,
      },
    ],
  },

apis: [
  "./routes/*.ts",
  "./controllers/*.ts",
],
};

const swaggerSpec =
  swaggerJsdoc(options);

export = swaggerSpec;
