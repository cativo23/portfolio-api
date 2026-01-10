# Portfolio API Documentation

This directory contains comprehensive documentation for the Portfolio API project, organized by topic for easier navigation and maintenance.

## 📁 Directory Structure

```
docs/
├── README.md (this file)
├── code-review.md          # Code review and current status
│
├── api/                    # API Reference Documentation
│   ├── endpoints.md        # Detailed API endpoint documentation
│   └── openapi.json        # OpenAPI specification
│
├── standardization/        # API Standards and Patterns
│   └── api-standards.md    # Response format, Swagger, request context
│
├── architecture/           # Architecture & Implementation Details
│   └── request-context.md  # Request context implementation (AsyncLocalStorage)
│
└── planning/              # Project Planning & Roadmap
    └── roadmap.md         # Improvement plan and task checklist
```

## 📚 Documentation Overview

### Quick Start

- **New to the project?** Start with [`code-review.md`](./code-review.md) for an overview of the codebase status
- **Want to use the API?** See [`api/endpoints.md`](./api/endpoints.md) for endpoint documentation
- **Understanding standards?** Read [`standardization/api-standards.md`](./standardization/api-standards.md)
- **Development roadmap?** Check [`planning/roadmap.md`](./planning/roadmap.md)

### Detailed Guide

#### API Documentation (`api/`)

- **`endpoints.md`**: Comprehensive API endpoint documentation with request/response examples
- **`openapi.json`**: OpenAPI 3.0 specification for Swagger/Postman integration

#### Standards (`standardization/`)

- **`api-standards.md`**: 
  - Response format standardization
  - Swagger documentation patterns
  - Request context implementation details
  - Pagination standards

#### Architecture (`architecture/`)

- **`request-context.md`**: Detailed explanation of the AsyncLocalStorage-based request context implementation

#### Planning (`planning/`)

- **`roadmap.md`**: 
  - Project improvement plan
  - Task checklist with completion status
  - Timeline and prioritization

#### Root Files

- **`code-review.md`**: Current code review status, strengths, and remaining improvements

## 🔗 Related Documentation

- **README.md** (project root): Project overview and setup instructions
- **Swagger UI**: Interactive API documentation at `/docs` when server is running

## 📝 Documentation Standards

All documentation follows these principles:

1. **Clear Structure**: Organized by topic in dedicated folders
2. **Current State**: Documents reflect the actual implementation
3. **Examples**: Code examples and JSON samples included
4. **Maintainable**: Single source of truth for each topic

## 🎯 Quick Links

- [API Endpoints](./api/endpoints.md)
- [API Standards](./standardization/api-standards.md)
- [Code Review](./code-review.md)
- [Roadmap](./planning/roadmap.md)
- [Request Context](./architecture/request-context.md)

---

**Last Updated**: 2026-01-08
