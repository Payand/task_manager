<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Task Manager API

A modern NestJS-based API for managing tasks, categories, and users, following DDD (Domain-Driven Design) principles, with robust validation, error handling, and auto-generated Swagger documentation.

## Features
- **Domain-Driven Design**: Aggregates, DTOs, and application services for clear separation of concerns.
- **Swagger/OpenAPI**: Auto-generated, localized, and validated API docs using custom `@ApiDoc` decorator and DTOs.
- **JWT Authentication**: Secure endpoints with JWT, using Passport and custom guards/strategies.
- **Validation**: All DTOs use `class-validator` and `class-transformer` for runtime validation and transformation.
- **Error Handling**: Consistent error responses and exception filters for all endpoints.
- **WebSocket Events**: Real-time task events via Socket.IO and a test HTML client.
- **Auto-open Swagger & WebSocket Test**: On dev startup, browser tabs for docs and WebSocket test auto-open (with lock file management).

## Project Structure
- `src/category/` - Category module (DDD, DTOs, controller, service)
- `src/task/` - Task module (DDD, DTOs, controller, service, gateway)
- `src/user/` - User/auth module (JWT, DTOs, controller, service)
- `src/shared/` - Shared decorators, DTOs, filters, guards
- `test/` - E2E tests for all major features

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file or set environment variables as needed. Defaults are provided for local development (see `ormconfig.ts`).

### 3. Run the app
```bash
npm run start:dev
```
- On first run, Swagger docs (`/api`) and WebSocket test (`/task-ws-test.html`) auto-open in your browser.

### 4. API Documentation
- Visit [http://localhost:3000/api](http://localhost:3000/api) for Swagger UI.
- JWT authentication is supported; login via `/auth/login` and the token is auto-injected into Swagger.

### 5. WebSocket Test
- Visit [http://localhost:3000/task-ws-test.html](http://localhost:3000/task-ws-test.html) to see real-time task events.

### 6. Testing
```bash
npm run test:e2e
```
Runs all end-to-end tests in the `test/` folder.

## Key Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT
- `GET /tasks` - List all tasks for the authenticated user
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `POST /tasks/:id/complete` - Mark task as complete
- `POST /tasks/:id/incomplete` - Mark task as incomplete
- `GET /categories` - List all categories
- `POST /categories/:name` - Create a new category

## Technologies Used
- [NestJS](https://nestjs.com/) (v11)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Swagger](https://swagger.io/)
- [Socket.IO](https://socket.io/)
- [class-validator](https://github.com/typestack/class-validator)
- [Passport](http://www.passportjs.org/)

## Development Notes
- All DTOs are decorated for both Swagger and validation.
- Custom `@ApiDoc` decorator ensures consistent, DRY API docs.
- Error handling is robust and consistent across all modules.
- DDD patterns are used for aggregates and service boundaries.
- Persian text has been replaced with English throughout the codebase.

## License
MIT
