# STAGE 3 — CONTACT FORM & POSTGRESQL INQUIRY IMPLEMENTATION

## 1. Executive Summary
Prior to Stage 3, the storefront contact form (`ContactPage.tsx`) and the admin management page (`AdminInquiriesPage.tsx`) relied exclusively on `localStorage` via `useInquiryStore.ts`. Inquiries submitted by customers in the browser were never transmitted to the backend, were never stored in PostgreSQL, and vanished as soon as the client refreshed or visited from a different device.

In Stage 3, a persistent, secure, end-to-end inquiry architecture was engineered:
`Customer contact form → REST API → Server validation & anti-abuse → PostgreSQL → Admin inquiry management`

---

## 2. Database Model
An additive Prisma model was designed and added to `prisma/schema.prisma`:

```prisma
model Inquiry {
  id            String   @id @default(cuid())
  name          String
  contactNumber String
  gmail         String
  requirement   String
  message       String
  status        String   @default("NEW")
  adminNotes    String?
  assignedTo    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
}
```

The database was synchronized, and an additive SQL migration was placed in `prisma/migrations/20260815000000_inquiry_system/migration.sql`.

---

## 3. Backend API Implementation (`backend/src/routes/inquiries.ts`)

### `POST /api/inquiries` (Public)
- **Validation:**
  - Name: 2–100 characters
  - Contact number: 7–25 characters
  - Email (`gmail` / `email`): Validated against RFC 5322 regex, max 150 characters
  - Requirement: 1–100 characters
  - Message: 5–3000 characters
- **Security & Privilege Isolation:**
  - Public callers are strictly prohibited from setting administrative fields. Any client-supplied `status`, `assignedTo`, or `adminNotes` are stripped out; new records are unconditionally set to `status: 'NEW'`.
- **Abuse Prevention:**
  - Sliding-window IP rate limiter blocks rapid automated submission bots (max 5 submissions per 10 minutes per IP).
- **Persistence:** Persists records to PostgreSQL via `prisma.inquiry.create`.

### `GET /api/inquiries` (Protected Admin)
- **RBAC:** Requires role `'OWNER'`, `'ORDER_MANAGER'`, `'CONTENT_MANAGER'`, `'STAFF'`, or `'SUPER_ADMIN'`.
- **Query Filters:** Supports `status` (`NEW`, `RESPONDED`, `ARCHIVED`), `search` (case-insensitive substring across name, phone, email, requirement, message), `page`, and `limit`.
- **Pagination:** Returns paginated JSON: `{ inquiries, pagination: { page, limit, total, totalPages } }`.

### `PATCH /api/inquiries/:id/status` (Protected Admin)
- **RBAC:** Requires role `'OWNER'`, `'ORDER_MANAGER'`, `'CONTENT_MANAGER'`, or `'SUPER_ADMIN'`.
- **Status State Machine:** Strictly enforces valid statuses: `NEW`, `RESPONDED`, `ARCHIVED`.
- **Updates:** Updates status, `adminNotes`, `assignedTo`, and automatically updates `updatedAt`.

### `DELETE /api/inquiries/:id` (Protected Admin)
- **RBAC:** Requires role `'OWNER'` or `'SUPER_ADMIN'`.
- Deletes the record from PostgreSQL and returns `HTTP 204 No Content`.

---

## 4. Frontend Integration

1. **Client API Service (`src/services/inquiryApi.ts`):**
   - Added typed methods: `submitInquiry()`, `getInquiries()`, `updateInquiryStatus()`, and `deleteInquiry()`.

2. **Inquiry Store (`src/stores/useInquiryStore.ts`):**
   - Replaced `localStorage` authoritative storage with reactive API calls.
   - Preserves state across page reloads.

3. **Storefront Contact Page (`src/pages/ContactPage.tsx`):**
   - Connected `handleSubmit` to `await addInquiry(...)`.
   - Added real-time loading feedback, double-submit protection, error reporting, and success notifications.
   - Retained 100% of the existing layout, styles, and animation effects.

4. **Admin Inquiries Page (`src/pages/admin/AdminInquiriesPage.tsx`):**
   - Connected status changes and admin note saves to asynchronous API mutations with toast notifications.
