# Frontend API Usage Guide

This document explains how the frontend should call the backend API, handle authentication (cookies), and work with common endpoints.

## Base URLs
- Production (current):
  - `https://talent-g878polq6-yousifs-projects-6b79b898.vercel.app`
- Alternative prod domains you might see:

Define the API base URL in your frontend env:
- Vite: `VITE_API_BASE_URL="https://talent-g878polq6-yousifs-projects-6b79b898.vercel.app"`
- Next.js: `NEXT_PUBLIC_API_BASE_URL=...`

## Auth Model (Cookies)
- The server sets an HTTP-only cookie `token` on login/register.
- You must send requests with credentials for protected endpoints:
  - fetch: `credentials: 'include'`
  - axios: `withCredentials: true`
- CORS must allow your frontend origin (backend env `CORS_ORIGIN`).

## Quick Start (fetch)
```js
const API = import.meta.env.VITE_API_BASE_URL;

// Login (POST-only)
await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});

// Get current user's applications (protected)
const apps = await fetch(`${API}/api/applications/employee?page=1&limit=10`, {
  credentials: 'include'
}).then(r => r.json());
```

## Quick Start (axios)
```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Login
await api.post('/api/auth/login', { email, password });

// List jobs (public)
const { data } = await api.get('/api/jobs', { params: { page: 1, limit: 10 } });
```

## Common Endpoints
- Health
  - GET `/health` → `{ status: 'OK', ... }`
- Auth
  - POST `/api/auth/login` { email, password }
  - POST `/api/auth/register` { userType: 'employee'|'employer'|'admin', ... }
  - POST `/api/auth/logout` (protected)
  - GET `/api/auth/profile` (protected)
  - PUT `/api/auth/profile` (protected)
- Jobs
  - GET `/api/jobs` (public, supports filters & pagination)
  - GET `/api/jobs/:id` (public)
  - POST `/api/jobs` (employer/admin)
  - PUT `/api/jobs/:id` (employer/admin)
  - DELETE `/api/jobs/:id` (employer/admin)
- Applications
  - POST `/api/applications/apply` (employee)
  - GET `/api/applications/employee` (employee)
  - GET `/api/applications/employer` (employer)
  - PUT `/api/applications/:id/status` (employer/admin)
  - PUT `/api/applications/:id/withdraw` (employee)
- Search/Discovery (public unless noted)
  - GET `/api/search/jobs`
  - GET `/api/search/jobs/suggestions` (protected)
  - GET `/api/search/candidates` (employer/admin)
  - GET `/api/search/employers`
  - GET `/api/search/skills/popular`
  - GET `/api/search/categories`
  - GET `/api/search/locations`
- Settings & Notifications (protected)
  - GET/PUT `/api/settings/preferences`
  - GET/PUT `/api/settings/privacy`
  - GET `/api/settings/export`
  - GET `/api/notifications`
  - PUT `/api/notifications/:id/read`
  - PUT `/api/notifications/read-all`

## Filters & Pagination
Most list endpoints accept:
- `page` (default 1), `limit` (default 10)
- Jobs search: `query`, `type`, `experience`, `education`, `location`, `isRemote`, `minSalary`, `maxSalary`
Example:
```
GET /api/jobs?page=2&limit=12&experience=Mid&isRemote=true
```

## Typical Flows
- Employee
  1) `POST /api/auth/login`
  2) `GET /api/jobs` → choose job
  3) `POST /api/applications/apply` { jobId, coverLetter, expectedSalary }
  4) `GET /api/applications/employee`
- Employer
  1) `POST /api/auth/login`
  2) `POST /api/jobs` (create)
  3) `GET /api/applications/employer`
  4) `PUT /api/applications/:id/status` { status: 'Reviewed'|'Shortlisted'|'Interviewed'|'Accepted'|'Rejected' }

## Error Handling
- Errors return `{ success: false, message, error? }` with appropriate HTTP codes (400/401/403/404/500).
- In production, messages are generic; in development, stack/details may appear.

## CORS & Cookies Checklist
- Frontend must send cookies: `credentials: 'include'` / `withCredentials: true`.
- Backend env must include your frontend origin in `CORS_ORIGIN` (comma-separated for multiple origins).
- In production, cookies use `SameSite=None; Secure` automatically.

## Type Hints (minimal)
```ts
export type Role = 'employee' | 'employer' | 'admin';
export interface LoginResponse { success: boolean; message: string; data: { user: { id: string; email: string; role: Role; }, token: string; } }
export interface JobsResponse { success: boolean; data: any[]; pagination?: { currentPage: number; totalPages: number; totalJobs: number; } }
```

## Troubleshooting
- 404 on `/api/auth/login`: Must use POST, not GET.
- CORS error in browser: Ensure `CORS_ORIGIN` includes your frontend URL; send requests with credentials.
- Not authenticated (401): Login first; send cookies with the request.
- Admin-only endpoints: require an admin account.

## Environments
- Production API: `https://talent-g878polq6-yousifs-projects-6b79b898.vercel.app`
- Local dev API (default): `http://localhost:3000`

This guide covers the patterns needed to consume the API reliably from any frontend (Vite, Next.js, CRA, etc.).
