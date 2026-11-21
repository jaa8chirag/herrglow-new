# Error Handling Implementation Playbook

Production-grade error handling patterns in TypeScript and React / Next.js.

---

## 1. Custom Application Error Hierarchy

```typescript
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(options: {
    message: string;
    code: ErrorCode;
    statusCode: number;
    details?: unknown;
    isOperational?: boolean;
  }) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    super({
      message: `${resource}${identifier ? ` with id '${identifier}'` : ''} not found.`,
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super({
      message,
      code: 'CONFLICT',
      statusCode: 409,
    });
  }
}
```

---

## 2. Type-Safe Result Pattern (Alternative to Throwing)

```typescript
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const err = <E = AppError>(error: E): Result<never, E> => ({
  success: false,
  error,
});
```

---

## 3. Next.js Server Action Safe Execution Wrapper

```typescript
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function safeAction<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    if (error instanceof ValidationError && error.details) {
      return {
        success: false,
        error: error.message,
        fieldErrors: error.details as Record<string, string[]>,
      };
    }

    if (error instanceof AppError && error.isOperational) {
      return { success: false, error: error.message };
    }

    // Programmer / unknown error - log full context securely
    console.error('Unhandled internal action error:', error);
    return {
      success: false,
      error: 'Something went wrong on our end. Please try again in a moment.',
    };
  }
}
```

---

## 4. Exponential Backoff with Jitter for Background Jobs

```typescript
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    maxDelayMs = 5000,
    backoffFactor = 2,
  } = options;

  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Add jitter between 0% and 30% of delay
      const jitter = Math.random() * 0.3 * delay;
      const sleepTime = Math.min(delay + jitter, maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
      delay *= backoffFactor;
    }
  }

  throw new Error('Unreachable');
}
```
