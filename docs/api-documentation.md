# Portfolio API Documentation

This document provides detailed information about the Portfolio API endpoints, including request and response examples.

## Table of Contents

- [Authentication](#authentication)
  - [Login](#login)
  - [Register](#register)
  - [Get Profile](#get-profile)
- [Projects](#projects)
  - [Get All Projects](#get-all-projects)
  - [Get Project by ID](#get-project-by-id)
  - [Create Project](#create-project)
  - [Update Project](#update-project)
  - [Delete Project](#delete-project)
- [Health Check](#health-check)
  - [Get Health Status](#get-health-status)

## Authentication

### Login

Authenticates a user and returns a JWT token.

**URL**: `/auth/login`

**Method**: `POST`

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2023-12-31T23:59:59.999Z",
    "user": {
      "id": 1,
      "username": "user",
      "email": "user@example.com"
    }
  }
}
```

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "User not found"
  }
}
```

OR

- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Password does not match"
  }
}
```

### Register

Registers a new user.

**URL**: `/auth/register`

**Method**: `POST`

**Authentication**: None

**Request Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "created_at": "2023-01-01T12:00:00.000Z",
    "updated_at": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists"
  }
}
```

### Get Profile

Returns the authenticated user's profile.

**URL**: `/auth/profile`

**Method**: `GET`

**Authentication**: Required (Bearer Token)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "user",
      "email": "user@example.com",
      "created_at": "2023-01-01T12:00:00.000Z",
      "updated_at": "2023-01-01T12:00:00.000Z"
    }
  }
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Unauthorized"
  }
}
```

## Projects

### Get All Projects

Returns a paginated list of projects.

**URL**: `/projects`

**Method**: `GET`

**Authentication**: Required (Bearer Token)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `is_featured` (optional): Filter by featured projects (true/false)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Project 1",
      "description": "Description of project 1",
      "is_featured": true,
      "created_at": "2023-01-01T12:00:00.000Z",
      "updated_at": "2023-01-01T12:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Project 2",
      "description": "Description of project 2",
      "is_featured": false,
      "created_at": "2023-01-02T12:00:00.000Z",
      "updated_at": "2023-01-02T12:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 2,
      "totalPages": 1
    }
  }
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Unauthorized"
  }
}
```

### Get Project by ID

Returns a specific project by ID.

**URL**: `/projects/:id`

**Method**: `GET`

**Authentication**: Required (Bearer Token)

**URL Parameters**:
- `id`: Project ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Project 1",
    "description": "Description of project 1",
    "is_featured": true,
    "created_at": "2023-01-01T12:00:00.000Z",
    "updated_at": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project not found"
  }
}
```

### Create Project

Creates a new project.

**URL**: `/projects`

**Method**: `POST`

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "title": "New Project",
  "description": "Description of new project",
  "is_featured": false
}
```

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "title": "New Project",
    "description": "Description of new project",
    "is_featured": false,
    "created_at": "2023-01-03T12:00:00.000Z",
    "updated_at": "2023-01-03T12:00:00.000Z"
  }
}
```

**Error Response**:
- **Code**: 422 Unprocessable Entity
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": ["title must not be empty"]
    }
  }
}
```

### Update Project

Updates an existing project.

**URL**: `/projects/:id`

**Method**: `PATCH`

**Authentication**: Required (Bearer Token)

**URL Parameters**:
- `id`: Project ID

**Request Body**:
```json
{
  "title": "Updated Project",
  "is_featured": true
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Updated Project",
    "description": "Description of project 1",
    "is_featured": true,
    "created_at": "2023-01-01T12:00:00.000Z",
    "updated_at": "2023-01-03T12:00:00.000Z"
  }
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project not found"
  }
}
```

### Delete Project

Deletes a project.

**URL**: `/projects/:id`

**Method**: `DELETE`

**Authentication**: Required (Bearer Token)

**URL Parameters**:
- `id`: Project ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "success",
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project not found"
  }
}
```

## Health Check

### Get Health Status

Returns the health status of the API.

**URL**: `/health`

**Method**: `GET`

**Authentication**: None

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  }
}
```

**Error Response**:
- **Code**: 503 Service Unavailable
- **Content**:
```json
{
  "status": "error",
  "info": {},
  "error": {
    "nestjs-docs": {
      "status": "down",
      "message": "Could not connect to https://docs.nestjs.com"
    }
  },
  "details": {
    "nestjs-docs": {
      "status": "down",
      "message": "Could not connect to https://docs.nestjs.com"
    },
    "storage": {
      "status": "up"
    }
  }
}
```