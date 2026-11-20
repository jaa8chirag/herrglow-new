# TypeScript Implementation Playbook

Production-ready TypeScript patterns for Next.js 16 App Router, React 19, Prisma ORM, and Turborepo monorepos.

---

## 1. Next.js 16 App Router Dynamic Route Contracts

In Next.js 15 and 16, `params` and `searchParams` on pages, layouts, and route handlers are **Promises**.

### Page Component Pattern
```typescript
interface PageProps {
  params: Promise<{ slug: string; city?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicePage({ params, searchParams }: PageProps) {
  const { slug, city } = await params;
  const query = await searchParams;
  const sort = typeof query.sort === 'string' ? query.sort : 'recommended';

  return (
    <main>
      <h1>Service: {slug}</h1>
    </main>
  );
}

// Generate Metadata with Promise params
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `HerrGlow | ${slug}`,
  };
}
```

### Route Handler Pattern (`app/api/services/[slug]/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { slug } = await context.params;
  return NextResponse.json({ slug });
}
```

---

## 2. Prisma Database Type Inference (Single Source of Truth)

Never declare manual interfaces that mirror database tables. Always infer from Prisma models to avoid schema drift.

### Model & Payload Types
```typescript
import { Prisma, Service, Category } from '@herrglow/db';

// 1. Single model inference
export type DbService = Service;

// 2. Query with relations using Prisma.Payload
export type ServiceWithCategoryAndReviews = Prisma.ServiceGetPayload<{
  include: {
    category: true;
    reviews: {
      select: { id: true; rating: true; comment: true; user: { select: { name: true } } };
    };
  };
}>;

// 3. Reusable typed select object using `satisfies`
export const publicProSelect = {
  id: true,
  slug: true,
  name: true,
  specialization: true,
  bio: true,
  basePrice: true,
} as const satisfies Prisma.ProSelect;

export type PublicPro = Prisma.ProGetPayload<{
  select: typeof publicProSelect;
}>;
```

---

## 3. Strict Boundary Validation with Zod ("Parse, Don't Validate")

Always validate external inputs at trust boundaries (APIs, Server Actions, Form Submissions).

```typescript
import { z } from 'zod';

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid({ message: 'Invalid service ID format' }),
  areaSlug: z.string().min(1, { message: 'Area is required' }),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' }),
  timeSlot: z.string().min(1, { message: 'Slot is required' }),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian phone number' }),
  customerName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  addOnIds: z.array(z.string().uuid()).default([]),
  groupSize: z.number().int().min(1).max(10).default(1),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
```

---

## 4. The `satisfies` Operator vs. `as` Assertions

Use `satisfies` to enforce that a value adheres to a contract without losing its specific literal type.

```typescript
type RouteConfig = {
  path: string;
  authRequired: boolean;
  roles?: ('CUSTOMER' | 'ADMIN' | 'PRO')[];
};

//  Compiler ensures every key conforms to RouteConfig,
// AND preserves literal string types for paths and role arrays:
export const ROUTES = {
  HOME: { path: '/', authRequired: false },
  BOOKING: { path: '/book', authRequired: false },
  ADMIN_DASHBOARD: { path: '/admin', authRequired: true, roles: ['ADMIN'] },
} as const satisfies Record<string, RouteConfig>;

// ROUTES.ADMIN_DASHBOARD.path is typed as '/admin', NOT generic string!
```

---

## 5. Exhaustive Union Narrowing with `never`

When operating on status unions or enums, guarantee compile-time exhaustiveness. If a new status is added in the database, the compiler will immediately flag all unhandled switch cases.

```typescript
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export function assertNever(value: never, errorMessage: string): never {
  throw new Error(`${errorMessage}: Received unexpected value: ${JSON.stringify(value)}`);
}

export function getBookingStatusBadge(status: BookingStatus): { label: string; className: string } {
  switch (status) {
    case 'PENDING':
      return { label: 'Awaiting Confirmation', className: 'bg-amber-50 text-amber-700' };
    case 'CONFIRMED':
      return { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', className: 'bg-purple-50 text-purple-700' };
    case 'COMPLETED':
      return { label: 'Completed', className: 'bg-blue-50 text-blue-700' };
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-rose-50 text-rose-700' };
    default:
      // If a new status like 'REFUNDED' is added, this line will NOT compile!
      return assertNever(status, 'Unhandled booking status');
  }
}
```

---

## 6. Type-Safe React 19 Server Actions & `useActionState`

```typescript
export type ActionState<TData = unknown> =
  | { status: 'idle' }
  | { status: 'success'; data: TData }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

export async function submitBookingAction(
  _prevState: ActionState<{ bookingId: string }>,
  formData: FormData
): Promise<ActionState<{ bookingId: string }>> {
  const rawData = Object.fromEntries(formData.entries());
  const parseResult = CreateBookingSchema.safeParse(rawData);

  if (!parseResult.success) {
    const formattedErrors = parseResult.error.flatten().fieldErrors;
    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      fieldErrors: formattedErrors,
    };
  }

  try {
    const booking = await createBookingService(parseResult.data);
    return { status: 'success', data: { bookingId: booking.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create booking';
    return { status: 'error', message };
  }
}
```

---

## 7. Branded Types for Domain ID Safety

Prevent accidentally passing a `serviceId` into a function expecting a `userId`.

```typescript
export type Brand<T, B> = T & { readonly __brand: B };

export type UserId = Brand<string, 'UserId'>;
export type ServiceId = Brand<string, 'ServiceId'>;
export type BookingId = Brand<string, 'BookingId'>;

export const toUserId = (id: string): UserId => id as UserId;
export const toServiceId = (id: string): ServiceId => id as ServiceId;
export const toBookingId = (id: string): BookingId => id as BookingId;

// Now this will produce a compiler error if you mix them up:
function cancelBooking(bookingId: BookingId, requestedBy: UserId) { ... }
```
