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

### Test Example

A simple test for a decorator:

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

### Authentication

The project uses JWT for authentication:
- Public endpoints should be marked with the `@Public()` decorator
- Protected endpoints automatically have access to the authenticated user via the `@User()` decorator