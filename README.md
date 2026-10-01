# Task Manager API

A RESTful backend API for a full-stack Task Manager application built with Node.js, Express, MongoDB, and Mongoose.

The API provides user authentication, authorization, task management, input validation, filtering, sorting, and pagination.

## Live Demo

[View Live Application](https://task-manager-frontend-xi-kohl.vercel.app)


## Features

* User registration and login
* Secure password hashing with bcrypt
* JWT authentication
* JWT stored in HttpOnly cookies
* Authentication middleware
* Protected API routes
* Role-based authorization
* User-specific task ownership
* Admin access to tasks across users
* Create, read, update, and delete tasks
* Task filtering by completion status
* Task sorting
* Pagination
* Request validation with Zod
* Centralized error handling
* MongoDB Atlas database integration
* RESTful API architecture
* CORS configuration for frontend integration

## Technologies

* Node.js
* Express.js
* MongoDB
* MongoDB Atlas
* Mongoose
* JSON Web Tokens (JWT)
* bcrypt
* Zod
* express-async-handler
* cookie-parser
* dotenv
* CORS

## Authentication & Security

The API uses JWT-based authentication.

After a successful login, the server creates a JWT containing the authenticated user's ID and sends it to the client using an HttpOnly cookie.

Protected requests follow this flow:

```text
User Login
    ↓
Verify Email & Password
    ↓
Create JWT
    ↓
Store JWT in HttpOnly Cookie
    ↓
Client Sends Authenticated Request
    ↓
Authentication Middleware
    ↓
Verify JWT
    ↓
Load User
    ↓
req.user
    ↓
Protected Controller
```

Passwords are hashed with bcrypt before being stored in the database.

The API also uses authorization middleware to restrict certain operations based on the authenticated user's role.

### User Ownership & Authorization

Regular users can access and manage only their own tasks.

Administrators can access and manage tasks belonging to all users.

This authorization logic is applied when retrieving, updating, and deleting tasks.

## Task Management

Authenticated users can:

* Create tasks
* View their tasks
* Update their tasks
* Delete their tasks
* Filter tasks by completion status
* Sort tasks
* Navigate tasks using pagination

Tasks are associated with their owning user through a MongoDB ObjectId reference.

Administrators can access tasks across users according to their assigned role.

## API Architecture

The backend follows a layered Express architecture:

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Model
  ↓
MongoDB
```

For example:

```text
POST /api/tasks
      ↓
Task Route
      ↓
Authentication Middleware
      ↓
Validation Middleware
      ↓
Task Controller
      ↓
Task Model
      ↓
MongoDB
```

## Project Structure

```text
task-manager-api/
│
├── config/
│   └── Database configuration
│
├── controllers/
│   ├── Authentication controllers
│   ├── User controllers
│   └── Task controllers
│
├── middleware/
│   ├── Authentication middleware
│   ├── Authorization middleware
│   ├── Validation middleware
│   └── Error handling
│
├── models/
│   ├── User model
│   └── Task model
│
├── routes/
│   ├── Authentication routes
│   ├── User routes
│   └── Task routes
│
├── utils/
│   └── Authentication and utility functions
│
├── validators/
│   └── Zod validation schemas
│
├── app.js
├── server.js
├── package.json
└── README.md
```

## Main API Endpoints

### Authentication

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/api/auth/signup` | Register a new user      |
| POST   | `/api/auth/login`  | Log in a user            |
| POST   | `/api/auth/logout` | Log out the current user |

### Users

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| GET    | `/api/users/me` | Get the authenticated user |

### Tasks

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | `/api/tasks`     | Get tasks        |
| GET    | `/api/tasks/:id` | Get a task by ID |
| POST   | `/api/tasks`     | Create a task    |
| PATCH  | `/api/tasks/:id` | Update a task    |
| DELETE | `/api/tasks/:id` | Delete a task    |

### Health Check

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | `/api/health` | Check API health |

## Query Features

The tasks endpoint supports filtering, sorting, and pagination through query parameters.

### Filter by Completion Status

Get completed tasks:

```text
GET /api/tasks?completed=true
```

Get incomplete tasks:

```text
GET /api/tasks?completed=false
```

### Pagination

Request a specific page and number of tasks per page:

```text
GET /api/tasks?page=1&limit=10
```

The API returns pagination information including:

* Current page
* Limit
* Total tasks
* Total pages

### Sorting

Sort tasks by creation date:

```text
GET /api/tasks?sort=-createdAt
```

The default sorting order is newest tasks first.

## Environment Variables

Create a `.env` file in the backend project:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration
NODE_ENV=development
```

Do not commit your `.env` file to GitHub.

## Installation

Clone the repository:

```bash
git clone https://github.com/Eagle-2026/task-manager-api.git
```

Navigate into the project:

```bash
cd task-manager-api
```

Install dependencies:

```bash
npm install
```

Create your `.env` file and add the required environment variables.

Start the development server:

```bash
npm run dev
```

The API will run locally on:

```text
http://localhost:3000
```

## Frontend

This API is used by the Task Manager Next.js frontend.

[Task Manager Frontend](https://github.com/Eagle-2026/task-manager-frontend)

## Future Improvements

* Automated API testing
* API documentation with Swagger/OpenAPI
* Password reset functionality
* Email verification
* Refresh token authentication
* Additional user management features
* Production monitoring and logging
