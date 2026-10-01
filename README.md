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

The project follows a layered structure:

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