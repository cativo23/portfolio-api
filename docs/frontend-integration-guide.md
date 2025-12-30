# Frontend Integration Guide

This guide provides step-by-step instructions for frontend developers to integrate with the Portfolio API, with a focus on the contact form implementation.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Contact Form Integration](#contact-form-integration)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Code Examples](#code-examples)

---

## Getting Started

### Base URL

The API base URL depends on your environment:

- **Development**: `http://localhost:3001` (or check your API configuration)
- **Production**: `https://your-api-domain.com`

### CORS Configuration

The API has CORS enabled to allow requests from frontend applications. By default, the following origins are allowed:

- `http://localhost:3000`
- `http://localhost:5173` (Vite default)
- `http://localhost:5174`

**For production**, configure the `CORS_ORIGINS` environment variable on the API server:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

The API accepts credentials and supports the following:
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, x-api-key
- **Credentials**: Enabled (cookies, authorization headers)

### API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:3001/docs` (or your configured port)

### Response Format

All API responses follow a standardized format:

**Success Response**:
```json
{
  "status": "success",
  "data": { ... },
  "meta": { ... }
}
```

**Error Response**:
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

---

## Authentication

### Overview

Most endpoints require authentication using JWT Bearer tokens. The contact form submission endpoint (`POST /contacts`) is public and does not require authentication.

### Authentication Flow

1. **Register a new user** (optional, if you need admin access):
   ```http
   POST /auth/register
   Content-Type: application/json

   {
     "username": "admin",
     "email": "admin@example.com",
     "password": "securePassword123"
   }
   ```

2. **Login to get access token**:
   ```http
   POST /auth/login
   Content-Type: application/json

   {
     "email": "admin@example.com",
     "password": "securePassword123"
   }
   ```

3. **Use the token in subsequent requests**:
   ```http
   Authorization: Bearer <your-access-token>
   ```

### Token Storage

Store the access token securely:
- **Browser**: Use `localStorage` or `sessionStorage` (consider security implications)
- **Mobile**: Use secure storage (Keychain/Keystore)
- **Never** store tokens in cookies without proper security flags

---

## Contact Form Integration

### Overview

The contact form allows visitors to submit messages without authentication. This is the primary public-facing endpoint.

### Endpoint

```
POST /contacts
```

**Authentication**: Not required (Public endpoint)

### Request Format

```typescript
interface ContactFormData {
  name: string;        // Required, 2-100 characters
  email: string;       // Required, valid email address
  message: string;     // Required, 10-1000 characters
  subject?: string;    // Optional, max 200 characters
}
```

### Implementation Example (React/TypeScript)

```typescript
import { useState } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

interface ContactResponse {
  status: 'success' | 'error';
  data?: {
    id: number;
    name: string;
    email: string;
    message: string;
    subject?: string;
    isRead: boolean;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    subject: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ContactResponse = await response.json();

      if (data.status === 'success') {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '', subject: '' });
      } else {
        setError(data.error?.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        minLength={2}
        maxLength={100}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Subject (optional)"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        maxLength={200}
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
        minLength={10}
        maxLength={1000}
      />
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Message sent successfully!</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

### Implementation Example (Vue.js)

```vue
<template>
  <form @submit.prevent="submitForm">
    <input
      v-model="formData.name"
      type="text"
      placeholder="Name"
      required
      minlength="2"
      maxlength="100"
    />
    <input
      v-model="formData.email"
      type="email"
      placeholder="Email"
      required
    />
    <input
      v-model="formData.subject"
      type="text"
      placeholder="Subject (optional)"
      maxlength="200"
    />
    <textarea
      v-model="formData.message"
      placeholder="Message"
      required
      minlength="10"
      maxlength="1000"
    />
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Message sent successfully!</div>
    <button type="submit" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send Message' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  name: '',
  email: '',
  message: '',
  subject: '',
});

const loading = ref(false);
const error = ref(null);
const success = ref(false);

const submitForm = async () => {
  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    const response = await fetch('http://localhost:3000/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    });

    const data = await response.json();

    if (data.status === 'success') {
      success.value = true;
      formData.value = { name: '', email: '', message: '', subject: '' };
    } else {
      error.value = data.error?.message || 'An error occurred';
    }
  } catch (err) {
    error.value = 'Network error. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
```

### Implementation Example (Vanilla JavaScript)

```javascript
async function submitContactForm(formData) {
  try {
    const response = await fetch('http://localhost:3000/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: formData.subject || undefined,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log('Message sent successfully!', data.data);
      return { success: true, data: data.data };
    } else {
      console.error('Error:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: { message: 'Network error' } };
  }
}

// Usage
const form = document.getElementById('contact-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
    subject: document.getElementById('subject').value,
  };

  const result = await submitContactForm(formData);
  
  if (result.success) {
    alert('Message sent successfully!');
    form.reset();
  } else {
    alert('Error: ' + result.error.message);
  }
});
```

---

## Error Handling

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed (422)
- `AUTHENTICATION_ERROR`: Authentication required or failed (401)
- `AUTHORIZATION_ERROR`: Insufficient permissions (403)
- `RESOURCE_NOT_FOUND`: Requested resource not found (404)
- `INTERNAL_SERVER_ERROR`: Server error (500)

### Handling Validation Errors

When validation fails, the API returns detailed error information:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["email must be an email"],
      "message": ["message must be longer than or equal to 10 characters"]
    }
  }
}
```

**Example Error Handling**:

```typescript
function handleApiError(error: any) {
  if (error.code === 'VALIDATION_ERROR' && error.details) {
    // Display field-specific errors
    Object.entries(error.details).forEach(([field, messages]) => {
      const fieldElement = document.getElementById(field);
      if (fieldElement) {
        fieldElement.setCustomValidity(messages[0]);
      }
    });
  } else {
    // Display general error message
    alert(error.message || 'An error occurred');
  }
}
```

---

## Best Practices

### 1. Input Validation

Always validate input on the frontend before sending to the API:

```typescript
function validateContactForm(data: ContactFormData): string[] {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.message || data.message.length < 10 || data.message.length > 1000) {
    errors.push('Message must be between 10 and 1000 characters');
  }
  
  return errors;
}
```

### 2. Loading States

Always show loading states during API calls:

```typescript
const [loading, setLoading] = useState(false);

// Disable form during loading
<button disabled={loading}>Submit</button>
```

### 3. Rate Limiting

Be aware that the API may implement rate limiting. Handle 429 (Too Many Requests) responses:

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
}
```

### 4. CORS Configuration

CORS is now configured on the API. If you encounter CORS issues:

1. **Check your frontend origin**: Ensure your frontend URL is in the allowed origins list
   - Default allowed: `http://localhost:3000`, `http://localhost:5173`, `http://localhost:5174`
   - For custom origins, set `CORS_ORIGINS` environment variable on the API server

2. **Verify request headers**: Ensure you're sending the correct headers:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     // Add Authorization header if needed
     // 'Authorization': 'Bearer <token>'
   }
   ```

3. **Handle preflight requests**: Browsers automatically send OPTIONS requests for CORS. The API handles these automatically.

4. **Check browser console**: Look for specific CORS error messages that can help identify the issue

### 5. Security

- **Never** expose API tokens in client-side code
- Use HTTPS in production
- Sanitize user input before displaying
- Implement CSRF protection if needed

### 6. Error Messages

Display user-friendly error messages:

```typescript
const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again',
  AUTHENTICATION_ERROR: 'Please log in to continue',
  RESOURCE_NOT_FOUND: 'The requested resource was not found',
  INTERNAL_SERVER_ERROR: 'Server error. Please try again later',
};

function getErrorMessage(error: any): string {
  return errorMessages[error.code] || error.message || 'An error occurred';
}
```

---

## Code Examples

### Complete React Hook Example

```typescript
import { useState } from 'react';

interface UseContactFormReturn {
  submit: (data: ContactFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (data: ContactFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
      } else {
        setError(result.error?.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { submit, loading, error, success, reset };
}
```

### Axios Example

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contact form submission
export async function submitContactForm(data: ContactFormData) {
  try {
    const response = await response.post('/contacts', data);
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.error,
      };
    }
    return {
      success: false,
      error: { message: 'Network error' },
    };
  }
}
```

---

## Testing

### Testing Contact Form Submission

```typescript
describe('Contact Form', () => {
  it('should submit contact form successfully', async () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message',
    };

    const response = await fetch('http://localhost:3000/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.status).toBe('success');
    expect(data.data.email).toBe(formData.email);
  });

  it('should handle validation errors', async () => {
    const formData = {
      name: 'A', // Too short
      email: 'invalid-email', // Invalid format
      message: 'Short', // Too short
    };

    const response = await fetch('http://localhost:3000/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    expect(response.status).toBe(422);
    expect(data.status).toBe('error');
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## Support

For additional support or questions:

1. Check the [API Documentation](./api-documentation.md)
2. Review the [Code Review](./code-review.md) for implementation details
3. Access the Swagger UI at `/docs` when the API is running

---

**Last Updated**: 2024
**API Version**: 1.0