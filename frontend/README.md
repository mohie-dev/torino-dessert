# Torino Dessert Frontend

The storefront and admin dashboard are implemented with Next.js App Router,
TypeScript, Tailwind CSS 4, Axios, TanStack Query, Zustand, React Hook Form, and
Zod.

## Requirements

- Node.js 20.9 or newer
- The Torino Dessert API running locally or at a reachable URL

## Run locally

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the API base URL, including its
versioned prefix (for example, `https://torino-dessert.onrender.com/api/v1` for
the demo backend, or `http://localhost:3000/api/v1` for local development).
The `.env.example` file is safe to commit; never commit `.env.local` or any
other file containing environment-specific values. Configure
`NEXT_PUBLIC_API_URL` in the hosting provider before building the app. Values
with the `NEXT_PUBLIC_` prefix are included in client-side code and must not
contain secrets.

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
npm audit
```

The storefront is available at `/`. Admin sign-in is at `/admin/login`; the
authenticated dashboard routes are `/admin`, `/admin/orders`, `/admin/products`,
`/admin/customers`, `/admin/reports`, `/admin/settings`, and `/admin/team`.
Admin links and page data are permission-aware, while the API remains
responsible for enforcing authorization.

Checkout sends product IDs and quantities only. Product pricing, delivery
fees, store availability, and the resulting total are validated and calculated
by the backend.
