---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
metadata:
  model: inherit
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging and user experiences.

## Use this skill when

- Designing and implementing error handling in new features and APIs
- Building error-resilient Server Actions, route handlers, and API endpoints
- Handling asynchronous background tasks and job queues (BullMQ, Redis, cron tasks)
- Designing user-friendly error messages that guide user recovery
- Implementing retry, exponential backoff, and circuit breaker patterns
- Preventing unhandled rejections, crashes, and silent failures

## Do not use this skill when

- The task is purely visual design without runtime behavior or data boundaries
- You are debugging an unrelated CSS styling layout issue

## Instructions

1. Clarify error boundaries, failure domains, and recovery strategies.
2. Model typed domain errors using custom error classes or Result types.
3. Distinguish between operational errors (transient network, invalid inputs) and programmer errors (bugs, invariant violations).
4. Provide actionable recovery paths for users and actionable logs with context for developers.
5. Refer to `resources/implementation-playbook.md` for complete code templates and patterns.

## Core Principles

### 1. Fail Fast & Validate at Boundaries

- Validate all incoming data at the trust boundary (Zod schemas for forms, APIs, and webhooks).
- Never let malformed payloads propagate deep into the business or database layers.

### 2. Differentiate User-Facing vs. Developer Logs

- **User-Facing:** Compassionate, human-readable, non-technical guidance explaining _what happened_ and _what to do next_ (e.g. _"This slot was just booked by someone else. Please choose another convenient time."_). Never expose raw database errors, stack traces, or SQL queries to end users.
- **Developer Logs:** Structured, contextual logging including timestamp, correlation ID, error stack, and request metadata for rapid triaging.

### 3. Graceful Degradation & Safe Fallbacks

- When secondary features fail (e.g. review stars, promotional banners, recommendation carousel), render graceful fallback UI rather than crashing the whole page.
- Wrap UI subtrees in React `<ErrorBoundary>`.

### 4. Idempotent Retries for Background Operations

- Operations like sending booking SMS/emails, processing webhooks, or syncing external calendars must be idempotent.
- Use exponential backoff with jitter for transient network or database connection drops.

## Resources

- [Implementation Playbook](file://./resources/implementation-playbook.md) for Result type implementations, custom ApplicationError classes, and React error boundary snippets.
