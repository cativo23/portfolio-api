# Portfolio API Development Guidelines

This document provides essential information for developers working on the Portfolio API project.

## Build/Configuration Instructions

### Project Setup

1. **Install Dependencies**:
   ```bash
   yarn install
   ```

2. **Environment Configuration**:
   - Create a `.env` file in the project root based on the `.env.example` file
   - Required environment variables:
     - `JWT_SECRET`: Secret key for JWT token generation
     - `JWT_EXPIRES_IN`: Token expiration time in seconds
     - Database connection parameters (see `.env.example` for details)

3. **Database Setup**:
   - The project uses TypeORM with MySQL
   - Run migrations to set up the database schema:
     ```bash
     yarn migration:run
     ```

### Running the Application

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

## Testing Information

### Test Configuration

The project uses Jest for testing with the following configuration:
- Unit tests are located alongside the code they test with the `.spec.ts` extension
- End-to-end tests are located in the `test` directory with the `.e2e-spec.ts` extension
- Test configuration is in `jest.config.ts` for unit tests and `test/jest-e2e.config.ts` for e2e tests

### Running Tests

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

### Writing Tests

#### Unit Tests

Unit tests should be placed in the same directory as the file they test, with the same name but with a `.spec.ts` extension.

Example unit test for a service:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { DependencyService } from '../dependency/dependency.service';

describe('YourService', () => {
  let service: YourService;
  let dependencyService: jest.Mocked<DependencyService>;

  beforeEach(async () => {
    const mockDependencyService = {
      someMethod: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: DependencyService, useValue: mockDependencyService },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    dependencyService = module.get(DependencyService) as jest.Mocked<DependencyService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call dependency service', async () => {
    dependencyService.someMethod.mockResolvedValue('result');

    const result = await service.methodThatUsesDependency();

    expect(dependencyService.someMethod).toHaveBeenCalled();
    expect(result).toBe('expected result');
  });
});
```

#### End-to-End Tests

E2E tests should be placed in the `test` directory with the `.e2e-spec.ts` extension.

Example e2e test:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200)
      .expect({ data: 'expected response' });
  });
});
```

### Test Examples

#### Testing a Simple Decorator

Example test for a simple decorator:

```typescript
// src/auth/decorators/public.decorator.spec.ts
import { SetMetadata } from '@nestjs/common';
import { Public } from './public.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  it('should call SetMetadata with correct parameters', () => {
    Public();
    expect(SetMetadata).toHaveBeenCalledWith('isPublic', true);
  });
});
```

Run with:
```bash
yarn test src/auth/decorators/public.decorator.spec.ts
```

#### Testing a Parameter Decorator

Example test for a parameter decorator:

```typescript
// src/auth/decorators/user.decorator.spec.ts
import { ExecutionContext } from '@nestjs/common';

// Import the factory function directly to test it
// This is the function that's passed to createParamDecorator in user.decorator.ts
const userFactory = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
};

describe('User Decorator Factory', () => {
  it('should extract user from request', () => {
    // Mock data
    const mockUser = { id: 1, username: 'testuser' };

    // Mock execution context
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: mockUser
        })
      })
    } as unknown as ExecutionContext;

    // Call the factory function with our mock context
    const result = userFactory(null, mockExecutionContext);

    // Verify the result
    expect(result).toEqual(mockUser);
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
  });
});
```

Run with:
```bash
yarn test src/auth/decorators/user.decorator.spec.ts
```

## Database Management

### Migrations

The project uses TypeORM migrations for database schema management:

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

## Code Style and Development Practices

### Code Formatting

The project uses ESLint and Prettier for code formatting and linting:

```bash
# Format code
yarn format

# Lint code
yarn lint
```

Configuration:
- ESLint configuration is in `.eslintrc.js`
- Prettier configuration is in `.prettierrc`

### Project Structure

- `src/`: Source code
  - `app.module.ts`: Main application module
  - `main.ts`: Application entry point
  - Feature modules (auth, users, projects, etc.)
    - `*.controller.ts`: HTTP request handlers
    - `*.service.ts`: Business logic
    - `*.module.ts`: Module definition
    - `dto/`: Data Transfer Objects
    - `entities/`: TypeORM entities
    - `decorators/`: Custom decorators
    - `guards/`: Authentication/authorization guards
    - `strategies/`: Passport authentication strategies
  - `config/`: Application configuration
  - `database/`: Database-related code and migrations
  - `core/`: Core functionality and shared code

### API Documentation

The project uses Swagger for API documentation, accessible at `/docs` when the application is running.

### API Response Standards

All API responses should follow these standardized formats:

#### Success Responses

Success responses should use the following structure:
```json5
{
  "status": "success",
  "data": {
    // Response data goes here
  },
  "meta": {
    // Metadata such as pagination info goes here (if applicable)
  }
}
```

For paginated responses, include pagination metadata:
```json5
{
  "status": "success",
  "data": [
    // Array of items
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
}
```

#### Error Responses

Error responses should use the following structure:
```json5
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (if applicable)
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: User is not authorized to perform action
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `INTERNAL_SERVER_ERROR`: Unexpected server error

#### Implementation

- Use the response transformation interceptor to transform all responses
- Use custom exception filters to handle errors
- Use response DTOs to define response structures

### Authentication

The project uses JWT for authentication:
- Public endpoints should be marked with the `@Public()` decorator
- Protected endpoints automatically have access to the authenticated user via the `@User()` decorator
