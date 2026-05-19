# Real-World Instruction Examples

Complete examples across various domains demonstrating effective instruction patterns.

## Table of Contents

- [Python Development](#python-development)
- [JavaScript/TypeScript](#javascripttypescript)
- [Testing](#testing)
- [Documentation](#documentation)
- [API Development](#api-development)
- [Security](#security)
- [Database](#database)
- [DevOps](#devops)

---

## Python Development

### Example 1: Python Code Style

````yaml
---
description: Python code style following PEP 8 with Black formatting, type hints, and comprehensive docstrings. Use for all Python files requiring production-quality code standards.
applyTo: "*.py"
---

## Code Style Requirements

### Formatting
1. **Black formatter**: Line length 88 characters
2. **Import organization**:
   - Standard library
   - Third-party packages
   - Local application imports
   - Separated by blank line between groups

### Type Annotations
- Add type hints for all function signatures
- Use `typing` module for complex types
- Include return type annotations

### Documentation
- Use Google-style docstrings
- Document all public functions and classes
- Include examples for complex functions

## Examples

### Good Example
```python
from typing import List, Optional
import re

def parse_email_addresses(text: str, validate: bool = True) -> List[str]:
    """Extract email addresses from text.

    Args:
        text: Input text to parse
        validate: Whether to validate email format

    Returns:
        List of email addresses found in text

    Example:
        >>> parse_email_addresses("Contact: user@example.com")
        ['user@example.com']
    """
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(pattern, text)

    if validate:
        emails = [e for e in emails if _is_valid_email(e)]

    return emails
````

### Avoid

```python
# No type hints, poor documentation
def parse(txt, val=True):
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.findall(pattern, txt)
```

## Imports Organization

```python
# Correct order
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, request

from myapp.models import User
from myapp.utils import validate_input
```

````

### Example 2: FastAPI Development

```yaml
---
description: FastAPI development patterns with Pydantic models, dependency injection, and async handlers. Use when implementing FastAPI endpoints or services.
applyTo:
  - "api/**/*.py"
  - "routers/**/*.py"
---

## API Endpoint Structure

### Route Handlers
1. Use async/await for I/O operations
2. Implement proper status codes
3. Use Pydantic models for request/response
4. Include OpenAPI documentation
5. Implement proper error handling

### Dependency Injection
- Use `Depends()` for shared logic
- Create reusable dependencies for auth, db sessions
- Type hint all dependencies

## Examples

### Complete Endpoint
```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str | None = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str | None

    class Config:
        from_attributes = True

async def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new user",
    description="Create a new user account with email and username"
)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """Create new user with validation."""
    # Check if user exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
````

### Error Handling

```python
from fastapi import HTTPException, status

# Good: Specific error with details
if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"User {user_id} not found",
        headers={"X-Error-Code": "USER_NOT_FOUND"}
    )

# Avoid: Generic errors
if not user:
    raise Exception("Error")
```

````

---

## JavaScript/TypeScript

### Example 3: React Component Standards

```yaml
---
description: React component development with TypeScript, hooks, and testing. Use when creating or modifying React components following best practices.
applyTo: "src/components/**/*.tsx"
---

## Component Structure

### Organization
1. **Imports**: React, types, hooks, components, styles
2. **Types**: Props interface
3. **Component**: Functional component with hooks
4. **Exports**: Named or default export
5. **Styles**: Co-located or imported

### TypeScript
- Define Props interface
- Use React.FC or explicit return type
- Type all event handlers
- Use strict mode

### Hooks
- Use hooks at top level
- Extract custom hooks for reusable logic
- Memoize expensive computations
- Use useCallback for passed functions

## Examples

### Complete Component
```tsx
import React, { useState, useCallback, useMemo } from 'react';
import { UserIcon } from '@/components/icons';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
  className
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updated = await updateUser(user.id, updates);
      setUser(updated);
      onUpdate?.(updated);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  }, [user, onUpdate]);

  const displayName = useMemo(() => {
    return user?.name || user?.email || 'Unknown User';
  }, [user]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className={`${styles.profile} ${className || ''}`}>
      <UserIcon size={48} />
      <h2>{displayName}</h2>
      <p className={styles.role}>{user.role}</p>
      <button
        onClick={() => handleUpdate({ role: 'admin' })}
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Promote to Admin'}
      </button>
    </div>
  );
};
````

### Custom Hook

```tsx
import { useState, useEffect } from 'react'

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useUser(userId: string): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUser(userId)
      setUser(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  return { user, loading, error, refetch: fetchUser }
}
```

````

---

## Testing

### Example 4: Pytest Testing Standards

```yaml
---
description: Pytest testing patterns with fixtures, parametrization, and mocking. Use when writing or reviewing Python test files following TDD best practices.
applyTo:
  - "**/*_test.py"
  - "**/test_*.py"
  - "tests/**/*.py"
priority: 10
---

## Test Structure

### File Organization
- Mirror source code structure in tests/
- One test file per source file
- Group related tests in classes

### Test Naming
- Functions: `test_<feature>_<scenario>_<expected>`
- Classes: `Test<FeatureName>`
- Fixtures: `<resource_name>_<type>`

### Test Pattern (AAA)
1. **Arrange**: Set up test data and fixtures
2. **Act**: Execute the code under test
3. **Assert**: Verify behavior with specific assertions

## Examples

### Basic Test Function
```python
import pytest
from myapp.calculator import Calculator

def test_add_positive_numbers_returns_sum():
    """Test adding two positive numbers."""
    # Arrange
    calc = Calculator()

    # Act
    result = calc.add(2, 3)

    # Assert
    assert result == 5
    assert isinstance(result, int)
````

### Using Fixtures

```python
import pytest
from myapp.models import User
from myapp.database import db

@pytest.fixture
def db_session():
    """Provide database session for tests."""
    session = db.create_session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def sample_user(db_session):
    """Create sample user for testing."""
    user = User(
        email="test@example.com",
        username="testuser"
    )
    db_session.add(user)
    db_session.commit()
    return user

def test_user_creation_persists_to_database(db_session, sample_user):
    """Test user is created and retrievable."""
    # Arrange - done by fixtures

    # Act
    retrieved = db_session.query(User).filter_by(
        email="test@example.com"
    ).first()

    # Assert
    assert retrieved is not None
    assert retrieved.username == "testuser"
    assert retrieved.email == "test@example.com"
```

### Parametrized Tests

```python
import pytest

@pytest.mark.parametrize("input_val,expected", [
    (0, 0),
    (1, 1),
    (2, 4),
    (3, 9),
    (-2, 4),
])
def test_square_returns_correct_value(input_val, expected):
    """Test square function with various inputs."""
    result = square(input_val)
    assert result == expected

@pytest.mark.parametrize("email", [
    "invalid.email",
    "@example.com",
    "user@",
    "user @example.com",
])
def test_email_validation_rejects_invalid_emails(email):
    """Test email validator rejects malformed emails."""
    with pytest.raises(ValueError, match="Invalid email"):
        validate_email(email)
```

### Mocking

```python
import pytest
from unittest.mock import Mock, patch, call

def test_send_notification_calls_external_api(mocker):
    """Test notification service calls API correctly."""
    # Arrange
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"success": True}

    mocker.patch('requests.post', return_value=mock_response)

    service = NotificationService()

    # Act
    result = service.send_notification(
        user_id="123",
        message="Test notification"
    )

    # Assert
    assert result is True
    requests.post.assert_called_once_with(
        "https://api.example.com/notify",
        json={"user_id": "123", "message": "Test notification"},
        headers={"Authorization": "Bearer token"}
    )
```

## Coverage Requirements

- Minimum 80% line coverage
- 100% coverage for critical paths
- Test both success and error cases
- Include edge cases and boundary conditions

````

---

## Documentation

### Example 5: API Documentation Standards

```yaml
---
description: API endpoint documentation standards with request/response examples, error cases, and authentication details. Use when documenting REST API endpoints.
applyTo: "docs/api/**/*.md"
---

## Required Sections

Every API endpoint documentation must include:

### 1. Overview
- Brief description (1-2 sentences)
- HTTP method and path
- Authentication requirement

### 2. Request
- Path parameters
- Query parameters
- Request body schema
- Headers

### 3. Response
- Success response (200, 201, etc.)
- Response body schema
- Response headers

### 4. Error Responses
- All possible error codes
- Error response format
- Common error scenarios

### 5. Examples
- Complete curl example
- Request/response pair
- Error example

## Template

```markdown
# [Endpoint Name]

[Brief description of what this endpoint does]

## Endpoint

`[METHOD] /api/v1/[path]`

**Authentication**: Required | Optional | None

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User identifier |

### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| limit | integer | No | Number of results | 10 |

### Request Body

```json
{
  "field": "value",
  "nested": {
    "field": "value"
  }
}
````

| Field | Type   | Required | Description       |
| ----- | ------ | -------- | ----------------- |
| field | string | Yes      | Field description |

## Response

### Success Response

**Status Code**: `200 OK`

```json
{
  "data": {
    "id": "123",
    "field": "value"
  },
  "meta": {
    "timestamp": "2026-02-02T12:00:00Z"
  }
}
```

## Error Responses

### 400 Bad Request

Invalid request parameters

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Field 'email' is required",
    "details": {
      "field": "email",
      "reason": "missing_required_field"
    }
  }
}
```

### 404 Not Found

Resource not found

### 500 Internal Server Error

Server processing error

## Examples

### cURL Example

```bash
curl -X POST https://api.example.com/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "newuser"
  }'
```

### Response Example

```json
{
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "username": "newuser",
    "created_at": "2026-02-02T12:00:00Z"
  }
}
```

```

## Complete Example

See template above applied to a real endpoint.

```

````

---

## API Development

### Example 6: REST API Design Standards

```yaml
---
description: RESTful API design standards with resource naming, versioning, and error handling conventions. Use when designing or implementing REST API endpoints.
applyTo:
  - "api/**/*.py"
  - "routes/**/*.py"
  - "controllers/**/*.py"
---

## API Design Principles

### Resource Naming
1. **Use nouns, not verbs**: `/users` not `/getUsers`
2. **Plural for collections**: `/users`, `/orders`
3. **Nested resources**: `/users/{id}/orders`
4. **Lowercase with hyphens**: `/order-items`

### HTTP Methods
- `GET`: Retrieve resource(s)
- `POST`: Create new resource
- `PUT`: Replace entire resource
- `PATCH`: Partial update
- `DELETE`: Remove resource

### Status Codes
- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE (no response body)
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Request/Response Format

### Standard Response Structure
```json
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "meta": {
    "timestamp": "2026-02-02T12:00:00Z"
  }
}
````

### Error Response Structure

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {
        "field": "email",
        "reason": "missing_required_field"
      }
    ]
  }
}
```

### Pagination

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "pages": 5
  },
  "links": {
    "self": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=2",
    "prev": null,
    "first": "/api/v1/users?page=1",
    "last": "/api/v1/users?page=5"
  }
}
```

## Examples

### Collection Endpoint

```python
@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List users with pagination."""
    offset = (page - 1) * per_page

    users = db.query(User).offset(offset).limit(per_page).all()
    total = db.query(User).count()

    return {
        "data": users,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page
        }
    }
```

### Resource Endpoint

```python
@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get single user by ID."""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )

    return {"data": user}
```

### Nested Resource

```python
@router.get("/users/{user_id}/orders", response_model=OrderListResponse)
async def list_user_orders(
    user_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List orders for specific user."""
    query = db.query(Order).filter(Order.user_id == user_id)

    if status:
        query = query.filter(Order.status == status)

    orders = query.all()
    return {"data": orders}
```

## Versioning

Use URL versioning:

- `/api/v1/users`
- `/api/v2/users`

Maintain backward compatibility within major versions.

````

---

## Security

### Example 7: Security Review Checklist

```yaml
---
description: Security review checklist for authentication, authorization, input validation, and data protection. Invoke explicitly when reviewing security-sensitive code changes.
disabledTools:
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
metadata:
  securityLevel: critical
  category: security-review
---

## Security Review Checklist

### Authentication
- [ ] Passwords are hashed with secure algorithm (bcrypt, Argon2)
- [ ] Password requirements enforced (length, complexity)
- [ ] Session tokens are cryptographically random
- [ ] Token expiration is implemented
- [ ] Secure token storage (httpOnly cookies or secure storage)
- [ ] No credentials in logs or error messages

### Authorization
- [ ] Every endpoint checks permissions
- [ ] User can only access their own resources
- [ ] Admin routes require admin role
- [ ] No privilege escalation paths
- [ ] Resource ownership verified

### Input Validation
- [ ] All user input is validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection enabled
- [ ] File upload validation (type, size, content)
- [ ] No eval() or exec() with user input

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced
- [ ] No secrets in code or environment variables (use secrets manager)
- [ ] PII handling follows regulations
- [ ] Secure deletion of sensitive data

### API Security
- [ ] Rate limiting implemented
- [ ] Request size limits enforced
- [ ] Authentication required for sensitive endpoints
- [ ] CORS configured correctly
- [ ] API keys rotated regularly

### Error Handling
- [ ] No sensitive data in error messages
- [ ] Stack traces not exposed to users
- [ ] Generic error messages for failed auth
- [ ] Errors logged securely

## Common Vulnerabilities

### SQL Injection
**Bad**:
```python
query = f"SELECT * FROM users WHERE email = '{email}'"
````

**Good**:

```python
query = "SELECT * FROM users WHERE email = ?"
cursor.execute(query, (email,))
```

### XSS

**Bad**:

```javascript
element.innerHTML = userInput
```

**Good**:

```javascript
element.textContent = userInput
// Or use DOMPurify for HTML
element.innerHTML = DOMPurify.sanitize(userInput)
```

### Insecure Direct Object Reference

**Bad**:

```python
@app.get("/orders/{order_id}")
def get_order(order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()
```

**Good**:

```python
@app.get("/orders/{order_id}")
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404)

    return order
```

## Review Process

1. **First Pass**: Check all items in checklist
2. **Code Review**: Examine implementation details
3. **Test Review**: Verify security test coverage
4. **Documentation**: Confirm security considerations documented
5. **Sign-off**: Security approval before merge

````

---

## Database

### Example 8: SQLAlchemy Patterns

```yaml
---
description: SQLAlchemy ORM patterns with relationships, transactions, and query optimization. Use when implementing database models or queries with SQLAlchemy.
applyTo:
  - "models/**/*.py"
  - "database/**/*.py"
---

## Model Definition

### Base Requirements
1. Use declarative base
2. Define `__tablename__`
3. Include `id` primary key
4. Add `created_at` and `updated_at` timestamps
5. Use type hints

### Naming Conventions
- Table names: snake_case, plural
- Column names: snake_case
- Relationship names: snake_case
- Model classes: PascalCase, singular

## Examples

### Basic Model
```python
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(100))
    bio = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}')>"
````

### Relationships

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)

    # One-to-many
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")

    # Many-to-many
    roles = relationship("Role", secondary="user_roles", back_populates="users")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Many-to-one
    author = relationship("User", back_populates="posts")

# Association table for many-to-many
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", secondary="user_roles", back_populates="roles")
```

### Query Patterns

```python
from sqlalchemy.orm import Session, joinedload, selectinload

def get_user_with_posts(db: Session, user_id: int) -> User:
    """Get user with eagerly loaded posts."""
    return db.query(User)\
        .options(joinedload(User.posts))\
        .filter(User.id == user_id)\
        .first()

def search_users(
    db: Session,
    query: str,
    limit: int = 20
) -> list[User]:
    """Search users by username or email."""
    search_pattern = f"%{query}%"
    return db.query(User)\
        .filter(
            (User.username.ilike(search_pattern)) |
            (User.email.ilike(search_pattern))
        )\
        .limit(limit)\
        .all()

def get_active_users_with_recent_posts(db: Session) -> list[User]:
    """Get users with posts from last 30 days."""
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    return db.query(User)\
        .join(User.posts)\
        .filter(Post.created_at >= thirty_days_ago)\
        .options(selectinload(User.posts))\
        .distinct()\
        .all()
```

### Transaction Patterns

```python
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

def create_user_with_profile(
    db: Session,
    user_data: dict,
    profile_data: dict
) -> User:
    """Create user and profile atomically."""
    try:
        # Create user
        user = User(**user_data)
        db.add(user)
        db.flush()  # Get user.id without committing

        # Create profile
        profile = Profile(user_id=user.id, **profile_data)
        db.add(profile)

        # Commit transaction
        db.commit()
        db.refresh(user)

        return user

    except IntegrityError as e:
        db.rollback()
        raise ValueError("User or profile already exists") from e
    except SQLAlchemyError as e:
        db.rollback()
        raise RuntimeError("Database error") from e
```

## Performance Tips

1. **Use indexes**: Add `index=True` for frequently queried columns
2. **Eager loading**: Use `joinedload()` or `selectinload()` to avoid N+1 queries
3. **Batch operations**: Use `bulk_insert_mappings()` for large inserts
4. **Connection pooling**: Configure appropriate pool size
5. **Query optimization**: Use `explain()` to analyze queries

````

---

## DevOps

### Example 9: Docker Configuration Standards

```yaml
---
description: Docker and containerization standards with multi-stage builds, security practices, and optimization. Use when creating or reviewing Dockerfiles and docker-compose configurations.
applyTo:
  - "**/Dockerfile"
  - "**/docker-compose.yml"
  - "**/docker-compose.yaml"
---

## Dockerfile Best Practices

### Structure
1. Use official base images
2. Implement multi-stage builds
3. Minimize layer count
4. Order instructions by change frequency
5. Use specific version tags (not `latest`)

### Security
1. Run as non-root user
2. Don't include secrets
3. Scan for vulnerabilities
4. Minimize installed packages
5. Use .dockerignore

## Examples

### Production Dockerfile (Python)
```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Runtime stage
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install dependencies
RUN pip install --no-cache /wheels/*

# Copy application
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
````

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_ENV=production
    ports:
      - '8000:8000'
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8000/health']
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U user']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - app-network

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### .dockerignore

```
# Version control
.git
.gitignore

# Python
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build
.venv
venv/

# Testing
.pytest_cache
.coverage
htmlcov/

# IDE
.vscode
.idea
*.swp

# Documentation
docs/
*.md
!README.md

# CI/CD
.github
.gitlab-ci.yml

# Environment
.env
.env.local

# Logs
*.log
```

## Optimization Tips

1. **Layer caching**: Copy dependency files before source code
2. **Multi-stage builds**: Separate build and runtime dependencies
3. **Minimal base images**: Use alpine or slim variants
4. **Combine RUN commands**: Reduce layers with && chaining
5. **Remove build artifacts**: Clean up in same RUN command

```

---

These examples demonstrate effective instruction patterns across various domains. Key takeaways:

1. **Clear scope**: Description and applyTo define when to use
2. **Actionable content**: Specific rules, not vague guidelines
3. **Examples**: Show good and bad patterns
4. **Structure**: Consistent format makes instructions scannable
5. **Context**: Explain *why* rules exist when non-obvious
```
