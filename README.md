# Task Manager API — PostgreSQL Edition

A production-style REST API for a task management application built with Node.js, Express, TypeScript, PostgreSQL, Redis, BullMQ, Docker, JWT authentication, and Zod validation.

This project is the PostgreSQL version of my Task Manager backend. It was rebuilt from an earlier MongoDB/Mongoose implementation to practice relational database design, SQL-based repositories, migrations, foreign-key relationships, and PostgreSQL application architecture.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- BullMQ
- Docker
- JWT
- bcrypt
- Zod
- Pino
- Jest
- Swagger

## Architecture

The project follows a layered architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

Background jobs use:

```text
API
  ↓
BullMQ Queue
  ↓
Redis
  ↓
Worker
```

## Main Features

- User registration and login
- JWT authentication
- Role-based authorization
- Task CRUD operations
- User-specific task ownership
- PostgreSQL relational data model
- SQL migrations
- Redis integration
- BullMQ background jobs
- Request validation with Zod
- Rate limiting
- Centralized error handling
- File upload support
- Swagger API documentation
- Docker development environment
- Automated tests with Jest

## PostgreSQL Migration

This version replaces MongoDB/Mongoose patterns with PostgreSQL equivalents.

Examples:

```text
MongoDB ObjectId
→ PostgreSQL integer IDs

Mongoose models
→ PostgreSQL tables

Mongoose queries
→ SQL repository queries

User ObjectId ownership
→ user_id foreign key

Schema-driven MongoDB setup
→ SQL migration files
```

## Database Migrations

Migration files are located in:

```text
migrations/
```

Current migrations include:

```text
001_create_users.sql
002_create_tasks.sql
003_create_sessions.sql
```

## Project Structure

```text
config/
controllers/
docs/
middleware/
migrations/
queues/
repositories/
routes/
services/
tests/
types/
utils/
validators/
workers/
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file and provide the required environment variables.

Example:

```env
PORT=3002

DB_USER=postgres
DB_HOST=localhost
DB_NAME=task_manager
DB_PASSWORD=your_password
DB_PORT=5432

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

Do not commit `.env` to GitHub.

### 3. Start Docker services

```bash
docker compose up -d
```

### 4. Check containers

```bash
docker compose ps
```

### 5. Start the development server

```bash
npm run dev
```

The API runs locally on:

```text
http://localhost:3002
```

## Build

```bash
npm run build
```

## Type Checking

```bash
npm run typecheck
```

## Tests

```bash
npm test
```

## Background Worker

Run the BullMQ worker with:

```bash
npm run worker:tasks
```

## Docker

The Docker setup includes:

- API
- PostgreSQL
- Redis
- BullMQ worker

Start everything with:

```bash
docker compose up -d
```

Stop everything with:

```bash
docker compose down
```

## API Documentation

Swagger documentation is included in:

```text
docs/
```

## MongoDB vs PostgreSQL Version

This repository is the PostgreSQL implementation of the same Task Manager architecture that also exists in a MongoDB/Mongoose version.

### MongoDB Version

Focuses on:

- MongoDB
- Mongoose
- ObjectId-based relationships
- Document-based persistence

### PostgreSQL Version

Focuses on:

- Relational database design
- SQL queries
- Foreign keys
- Migration files
- PostgreSQL repositories
- SQL-based persistence

Building both versions helped me practice working with both document databases and relational databases while preserving the same application architecture and business logic.

## Status

The project is fully functional in local Docker development with PostgreSQL and Redis.

The MongoDB version is deployed publicly, while this PostgreSQL version is maintained as a separate backend implementation for portfolio and learning purposes.