# Portfolio API

[![Coverage](https://img.shields.io/badge/coverage-90.1%25-brightgreen)](https://github.com/cativo23/portfolio-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D23.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://hub.docker.com/)

## Description

Portfolio API is a RESTful API built with NestJS for managing portfolio projects. It provides endpoints for authentication, user management, and project management. The API is designed to be used as a backend for a portfolio website or application.

Key features:
- User authentication with JWT
- Project management (CRUD operations)
- Contact form submission (public endpoint)
- Contact management for administrators
- Pagination, filtering, and search functionality
- Health checks for monitoring
- Standardized API responses
- Comprehensive error handling

## API Endpoints

### Authentication

- `POST /auth/login` - User login
  - Request body: `{ "email": "user@example.com", "password": "password" }`
  - Response: JWT token and user information

- `POST /auth/register` - User registration
  - Request body: `{ "username": "user", "email": "user@example.com", "password": "password" }`
  - Response: Created user information

- `GET /auth/profile` - Get user profile (requires authentication)
  - Response: User profile information

### Projects

- `GET /projects` - Get all projects (requires authentication)
  - Query parameters:
    - `page` - Page number (default: 1)
    - `per_page` - Items per page (default: 10)
    - `search` - Search term
    - `is_featured` - Filter by featured projects (true/false)
  - Response: List of projects with pagination

- `GET /projects/:id` - Get a project by ID (requires authentication)
  - Response: Project details

- `POST /projects` - Create a new project (requires authentication)
  - Request body: Project details
  - Response: Created project information

- `PATCH /projects/:id` - Update a project by ID (requires authentication)
  - Request body: Project details to update
  - Response: Updated project information

- `DELETE /projects/:id` - Delete a project by ID (requires authentication)
  - Response: Deletion confirmation

### Contacts

- `POST /contacts` - Submit a contact form (public endpoint, no authentication required)
  - Request body: `{ "name": "John Doe", "email": "john@example.com", "message": "Hello...", "subject": "Optional subject" }`
  - Response: Created contact information

- `GET /contacts` - Get all contacts (requires authentication, admin only)
  - Query parameters:
    - `page` - Page number (default: 1)
    - `per_page` - Items per page (default: 10)
    - `search` - Search term (searches in name, email, message)
    - `is_read` - Filter by read status (true/false)
  - Response: List of contacts with pagination

- `GET /contacts/:id` - Get a contact by ID (requires authentication, admin only)
  - Response: Contact details

- `PATCH /contacts/:id/read` - Mark a contact as read (requires authentication, admin only)
  - Response: Updated contact information

- `DELETE /contacts/:id` - Delete a contact by ID (requires authentication, admin only)
  - Response: Deletion confirmation

### Health Check

- `GET /health` - Check API health
  - Response: Health check information

## Environment Variables

The following environment variables are required for the application to run:

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_EXPIRES_IN` - Token expiration time in seconds
- `CORS_ORIGINS` - (Optional) Comma-separated list of allowed CORS origins. Defaults to `http://localhost:3000,http://localhost:5173,http://localhost:5174` in development
- `PORT` - (Optional) Server port. Defaults to 3000
- `NODE_ENV` - (Optional) Environment (development/production). In development, CORS is more permissive

## Project Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cativo23/portfolio-api.git
   cd portfolio-api
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Create environment file**:
   Create a `.env` file in the project root with the required environment variables:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_NAME=portfolio
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=3600
   ```

4. **Run database migrations**:
   ```bash
   yarn migration:run
   ```

## Running the Application

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

## Database Management

```bash
# Generate a new migration based on entity changes
yarn migration:generate src/database/migrations/MigrationName

# Create an empty migration
yarn migration:create src/database/migrations/MigrationName

# Run pending migrations
yarn migration:run

# Revert the last migration
yarn migration:revert
```

## Testing

```bash
# Run all unit tests
yarn test

# Run tests with watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run end-to-end tests
yarn test:e2e

# Debug tests
yarn test:debug
```

## Path Aliases

This project uses TypeScript path aliases to make imports more readable and maintainable. The following aliases are available:

- `@core/*`: Core functionality and shared code (`src/core/*`)
- `@auth/*`: Authentication module (`src/auth/*`)
- `@users/*`: Users module (`src/users/*`)
- `@projects/*`: Projects module (`src/projects/*`)
- `@config/*`: Configuration files (`src/config/*`)
- `@database/*`: Database-related code (`src/database/*`)
- `@health/*`: Health check module (`src/health/*`)
- `@src/*`: Root source directory (`src/*`)

Example usage:
```typescript
// Instead of relative imports like:
import { SomeService } from '../../users/some.service';

// Use path aliases:
import { SomeService } from '@users/some.service';
```

## Deployment

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Yarn package manager

### Production Deployment Steps

1. **Build the application**:
   ```bash
   yarn build
   ```

2. **Set up environment variables**:
   Ensure all required environment variables are set in your production environment.

3. **Run database migrations**:
   ```bash
   yarn migration:run
   ```

4. **Start the application**:
   ```bash
   yarn start:prod
   ```

### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t portfolio-api .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 --env-file .env portfolio-api
   ```

## API Documentation

For detailed API documentation, you can access the Swagger UI when the application is running:

```
http://localhost:3000/docs
```

This provides an interactive interface to explore and test all API endpoints.

### Additional Documentation

- **[API Documentation](./docs/api-documentation.md)**: Detailed endpoint documentation with request/response examples
- **[Frontend Integration Guide](./docs/frontend-integration-guide.md)**: Step-by-step guide for frontend developers
- **[Code Review](./docs/code-review.md)**: Comprehensive code review and recommendations

## Authentication Flow

1. **Registration**: Create a new user account using the `/auth/register` endpoint
2. **Login**: Authenticate with email and password using the `/auth/login` endpoint
3. **Using the token**: Include the JWT token in the Authorization header for protected endpoints:
   ```
   Authorization: Bearer <your-token>
   ```
4. **Profile**: Access your user profile using the `/auth/profile` endpoint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License—see the LICENSE file for details.
