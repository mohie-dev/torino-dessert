# Torino Dessert

> Brand Website & Ordering Management System for Torino Dessert.

Torino Dessert is a growing dessert brand based in Mansoura, Egypt.

This project gives Torino a professional digital presence while providing a
simple ordering and management system that can support the business as it
grows.

The system combines a customer-facing brand website with an internal admin
dashboard for managing products, orders, customers, and basic business
insights.

---

## 🚦 Current Status

> 🚧 **MVP — In Development**

The **backend is functionally complete** for the MVP scope. The **frontend is
built and connected**, and is in the final polish stage.

| Area | Status | Notes |
| --- | --- | --- |
| Database schema & migrations | ✅ Done | 7 migrations applied, `synchronize: false` |
| Authentication (JWT) | ✅ Done | Login + `/auth/me`, bcrypt hashing |
| RBAC (roles & permissions) | ✅ Done | Dynamic roles, permissions injected into JWT |
| Categories CRUD | ✅ Done | Soft delete via `isActive` |
| Products CRUD | ✅ Done | Archive / restore / toggle availability, image upload |
| Orders & lifecycle | ✅ Done | 6 statuses, cancel only while `PENDING` |
| Customers | ✅ Done | Auto-created from orders, read-only admin view |
| Dashboard statistics | ✅ Done | Totals, active orders, today's orders & revenue |
| Reports | ✅ Done | Sales summary + top products over a date range |
| Store settings | ✅ Done | Delivery fee, open/closed state, social links |
| Cloudinary uploads | ✅ Done | Product images |
| Real-time order alerts | ✅ Done | Socket.IO namespace `/admin-orders` + sound |
| Storefront (home, catalog, checkout) | ✅ Done | Responsive, brand-styled |
| Admin dashboard (7 pages) | ✅ Done | Overview, orders, products, customers, reports, settings, team |
| Public order tracking | ⏳ Next | Customer-facing status lookup |
| Product details page | ⏳ Next | Dedicated storefront page per product |
| Automated tests | ⏳ Next | Only framework defaults exist so far |
| `docs/` folder | ⏳ Next | Technical specs and API overview |

---

## 🎯 Project Goals

The main goals of the project are to:

- Build a professional online presence for Torino Dessert.
- Present Torino's brand identity and products in a premium experience.
- Allow customers to browse products and place orders directly.
- Organize and centralize incoming orders.
- Provide the team with a simple management dashboard.
- Start collecting real business data from the beginning.
- Provide useful statistics and reports to support future decisions.
- Build a maintainable foundation that can grow with the business.

---

## ✨ Features

### 🌐 Customer Website

Live at `/`:

- Home page with brand hero, catalog, and story section
- Product catalog with category filter and search
- Add-to-cart with persistent storage (Zustand + localStorage)
- Quantity editing and cart review inside checkout
- Checkout with validated customer, delivery, and notes data
- Order confirmation with a generated order reference
- Contact section with phone, WhatsApp, Facebook, and Instagram
- Responsive design (mobile, tablet, desktop)

The website focuses on **brand presentation** and **customer experience**,
rather than functioning as a simple online menu.

> **Still to add:** a standalone cart page, a product details page, and a
> public order-tracking page.

---

### 🛒 Ordering System

Customers can:

1. Browse Torino products.
2. Filter by category or search by name.
3. Add products to the cart.
4. Adjust quantities.
5. Review their order.
6. Provide their contact and delivery information.
7. Submit the order.
8. Receive an order reference.

**Checkout is intentionally "thin".** The storefront sends product IDs and
quantities only. The backend validates availability, resolves live prices,
applies the delivery fee, and calculates the total. The store's open/closed
state is enforced server-side, so a closed store rejects orders even if the UI
is stale.

#### Order Lifecycle

```text
Pending
   ↓
Confirmed
   ↓
Preparing
   ↓
Out for Delivery
   ↓
Completed
```

An order can also be marked as:

```text
Cancelled
```

Cancellation is only allowed while an order is still `PENDING`.

> The MVP does not require customers to create an account.

---

### 🧑‍💼 Admin Dashboard

Available at `/admin` after signing in at `/admin/login`.

**Overview** — all-time orders, active orders, today's orders, today's revenue.

**Orders** — searchable and filterable list, full order details, status
updates, and cancellation. New orders arrive in real time with a notification
and a sound cue.

**Products** — full CRUD, image upload, price editing, availability toggle,
archive/restore, and category assignment.

**Categories** — create, edit, and deactivate from within the products page.

**Customers** — list, search, and per-customer order history.

**Reports** — date-range sales summary (revenue, order counts, completed,
cancelled, average order value) and a top-selling products ranking.

**Team** — staff accounts, role assignment, activation/deactivation, and role
management with a permission matrix.

**Settings** — store name, phone, WhatsApp, social links, delivery fee, and
open/closed toggle.

---

## 📊 Business Insights

The system starts collecting useful business data from the first real order.

Currently available:

- Total number of orders
- Total revenue (excluding cancelled orders)
- Active orders
- Today's orders and today's revenue
- Average order value over a period
- Completed and cancelled orders per period
- Most requested products per period

> **Planned:** revenue trend charts over time, repeat-customer analysis, and
> exportable reports.

The collected data is also useful when presenting Torino's activity and growth
to potential suppliers or business partners.

---

## 🏗️ Technical Direction

The project is a **modular monolith** focused on maintainability and fast
development, avoiding unnecessary infrastructure during the MVP stage.

### Backend

- NestJS 12, TypeScript 6 (ESM)
- PostgreSQL + TypeORM (migrations, `synchronize: false`)
- JWT authentication with Passport
- Swagger / OpenAPI at `/api/v1/docs`
- class-validator + class-transformer
- Socket.IO gateway for real-time order updates
- Cloudinary for image uploads
- Vitest for unit and e2e tests
- oxlint + Prettier

### Frontend

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- TanStack Query for server state
- Zustand for cart and UI state (with persistence)
- React Hook Form + Zod for forms and validation
- Axios for HTTP, socket.io-client for live updates
- lucide-react for icons

### Storage

Product images are stored on Cloudinary.

---

## 🧱 Architecture

```text
                        ┌──────────────────────────┐
                        │    Customer Website      │
                        │   Next.js  ·  port 3001  │
                        └────────────┬─────────────┘
                                     │  REST  /api/v1
                                     │  Socket.IO /admin-orders
                        ┌────────────▼─────────────┐
                        │      NestJS API          │
                        │  Auth (JWT + RBAC)       │
                        │  Users · Roles           │
                        │  Categories · Products   │
                        │  Customers · Orders      │
                        │  Reports · Settings      │
                        │  Cloudinary · Health     │
                        └──────┬─────────────┬─────┘
                               │             │
                ┌──────────────▼───┐   ┌─────▼─────────────┐
                │   PostgreSQL     │   │     Cloudinary    │
                │   (migrations)   │   │   product images  │
                └──────────────────┘   └───────────────────┘
```

Global backend behavior:

- All routes require a JWT unless marked `@Public()`
- `@RequirePermissions()` enforces RBAC through a global guard
- `ValidationPipe` runs globally with `whitelist` and `forbidNonWhitelisted`
- A global exception filter standardizes error responses
- A global interceptor standardizes success responses

---

## 📂 Project Structure

```text
torino-dessert/
├── backend/
│   └── src/
│       ├── common/            # guards, decorators, filters, interceptors
│       ├── config/            # env validation, database, storage, data-source
│       ├── migrations/        # TypeORM migrations
│       ├── modules/
│       │   ├── auth/          # login, /me, JWT strategy
│       │   ├── users/         # staff accounts
│       │   ├── roles/         # roles & permission matrix
│       │   ├── categories/    # product categories
│       │   ├── products/      # products CRUD + availability
│       │   ├── customers/     # customers created from orders
│       │   ├── orders/        # orders, lifecycle, stats, gateway
│       │   ├── reports/       # sales + top products
│       │   ├── settings/      # store settings (singleton)
│       │   ├── cloudinary/    # image uploads
│       │   └── health/        # health check
│       ├── scripts/           # seed-admin, seed-products
│       ├── utils/enums.ts     # OrderStatus, PaymentMethod, Permission
│       ├── app.module.ts
│       └── main.ts
└── frontend/
    └── src/
        ├── app/
        │   ├── (storefront)/  # home, catalog, checkout, checkout/success
        │   └── admin/         # login + protected dashboard routes
        ├── components/
        │   ├── storefront/    # navbar, catalog, product card, checkout form…
        │   └── admin/         # shell, feedback states, confirm dialog
        ├── contexts/          # auth context
        ├── hooks/             # use-orders-socket
        ├── lib/               # axios clients, API wrappers, formatting
        ├── schemas/           # Zod schemas
        └── stores/            # cart store, UI store
```

---

## 🔌 API Overview

Base URL: `http://localhost:3000/api/v1` · Docs: `/api/v1/docs` (non-production)

### Public

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/auth/login` | Sign in and receive a JWT |
| `GET` | `/auth/me` | Current user profile |
| `GET` | `/categories` | Active categories |
| `GET` | `/products/storefront` | Available, non-archived products |
| `GET` | `/settings` | Public store settings (delivery fee, open state) |
| `POST` | `/orders` | Place an order (checkout) |

### Orders (admin)

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/orders` | `orders:read` |
| `GET` | `/orders/stats` | `dashboard:read` |
| `GET` | `/orders/:id` | `orders:read` |
| `PATCH` | `/orders/:id/status` | `orders:update` |
| `PATCH` | `/orders/:id/cancel` | `orders:update` |

### Products & Categories (admin)

| Method | Endpoint | Permission |
| --- | --- | --- |
| `POST` `GET` | `/products` | `products:create` / `products:read` |
| `GET` `PATCH` `DELETE` | `/products/:id` | `products:read` / `products:update` / `products:delete` |
| `PATCH` | `/products/:id/toggle-availability` | `products:update` |
| `PATCH` | `/products/:id/restore` | `products:update` |
| `POST` `GET` | `/categories` | `products:create` / public |
| `GET` `PATCH` `DELETE` | `/categories/:id` | `products:read` / `products:update` / `products:delete` |

### Customers, Reports, Settings, Team

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/customers`, `/customers/:id` | `customers:read` |
| `GET` | `/reports/sales`, `/reports/top-products` | `reports:read` |
| `PATCH` | `/settings` | `settings:manage` |
| `POST` `GET` | `/users` | `users:create` / `users:read` |
| `GET` `PATCH` | `/users/:id`, `/users/:id/status` | `users:read` / `users:update` |
| `POST` `GET` | `/roles` | `roles:manage` |
| `PATCH` `DELETE` | `/roles/:id` | `roles:manage` |
| `POST` | `/upload/image` | `products:update` |

---

## 🗄️ Domain Model

```text
Role ──< User
Category ──< Product
Customer ──< Order ──< OrderItem
StoreSetting (singleton row)
```

Key design decisions:

- **Orders snapshot customer and product data.** Name, phone, email, delivery
  address, product name, and unit price are copied onto the order at creation
  time, so later edits never rewrite history.
- **Products and categories are soft-deleted.** `isArchived` and `isActive`
  keep historical orders intact.
- **Customers are derived from orders.** There is no separate sign-up; a
  customer record is found or created from the checkout payload.
- **Store settings are a single row.** The delivery fee and open/closed state
  live in the database and are editable from the dashboard.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9+
- A PostgreSQL database

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
DATABASE_URI=postgresql://user:password@localhost:5432/torino
JWT_ACCESS_SECRET=<long-random-secret>

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SEED_ADMIN_EMAIL=admin@torino.com
SEED_ADMIN_PASSWORD=<strong-password>
```

`NODE_ENV`, `PORT`, `DATABASE_URI`, `API_PREFIX`, and `JWT_ACCESS_SECRET` are
validated at boot — the app refuses to start without them.

```bash
npm run migration:run     # apply migrations
npm run seed:admin        # create the Super Admin account
npm run seed              # optional: demo categories and products
npm run start:dev         # http://localhost:3000/api/v1
```

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev               # http://localhost:3001
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the API base URL including its
versioned prefix, for example `http://localhost:3000/api/v1`. Never commit
`.env.local`. Values prefixed with `NEXT_PUBLIC_` ship to the client and must
never contain secrets.

### Checks

```bash
# backend
npm run lint
npm run test
npm run test:e2e

# frontend
npm run typecheck
npm run lint
npm run build
```

---

## 📦 MVP Scope

### Included

- ✅ Brand website
- ✅ Product catalog with category filter and search
- ✅ Shopping cart with persistence
- ✅ Checkout with server-side validation and pricing
- ✅ Order management with a full lifecycle
- ✅ Product management (CRUD, images, availability, archive)
- ✅ Category management
- ✅ Admin authentication and RBAC
- ✅ Dashboard statistics
- ✅ Sales and top-products reports
- ✅ Customer data and order history
- ✅ Real-time order notifications

### Still to add before launch

- ⏳ Public order-tracking page (customer looks up a status by order number)
- ⏳ Standalone cart page
- ⏳ Product details page
- ⏳ Automated tests for business-critical flows
- ⏳ `docs/` — technical specification, database design, API overview
- ⏳ Production deployment runbook

### Not Included in the Initial MVP

- Online payments
- Customer accounts
- Loyalty program
- Coupons
- Advanced inventory management
- Supplier management
- Multiple branches
- Map-based delivery tracking
- WhatsApp API automation
- Advanced notification systems

These are intentionally outside the initial scope so the project can focus on
the core business experience and launch quickly.

---

## 🗺️ Roadmap

### Phase 1 — Backend Foundation ✅ Complete

- Project setup, database design, ERD
- Authentication, users, roles, permissions
- Categories, products, image uploads
- Customers, orders, order lifecycle
- Dashboard statistics, reports
- Store settings, health checks
- Real-time order notifications
- API documentation

### Phase 2 — Customer Website ✅ Complete

- Project layout and Torino visual identity
- Home page, brand sections, contact
- Product catalog with filters
- Cart, checkout, order confirmation

### Phase 3 — Admin Dashboard ✅ Complete

- Admin layout and login
- Orders, products, categories, customers
- Dashboard statistics, reports
- Team management and store settings

### Phase 4 — Integration & Polish ⏳ In Progress

- Order tracking and product details pages
- Loading, empty, and error states
- Responsive improvements and mobile testing
- Business flow testing end to end

### Phase 5 — Feedback & Launch ⏳ Pending

- Internal and client testing
- Collect real feedback, fix business/UX issues
- Documentation and deployment
- MVP release

---

## 📌 Roadmap Priorities

Ordered by business value for the launch:

1. **Public order tracking** — customers can follow their order status.
2. **Product details page** — richer product presentation and SEO surface.
3. **Test coverage** — orders, checkout, permissions, and reports.
4. **Documentation** — `docs/technical-specification.md`, `docs/database-design.md`,
   `docs/api-overview.md`, `docs/deployment.md`.
5. **Deployment runbook** — environment setup and release steps.

---

## 🔀 Git Workflow

Development is managed through **GitHub Issues and Pull Requests**.

Each meaningful feature or task should have a related GitHub Issue.

### Branch Naming

```text
feat/<issue-number>-<short-description>
fix/<issue-number>-<short-description>
refactor/<issue-number>-<short-description>
chore/<issue-number>-<short-description>
docs/<issue-number>-<short-description>
```

Examples:

```text
feat/12-order-creation
feat/18-admin-orders
fix/21-cart-quantity
docs/5-api-documentation
```

---

## 📝 Commit Convention

Commits follow a simple Conventional Commits style:

```text
feat(scope): description
fix(scope): description
refactor(scope): description
chore(scope): description
docs(scope): description
test(scope): description
```

Examples:

```text
feat(orders): implement order creation
fix(cart): prevent invalid quantities
docs(api): document order endpoints
test(orders): add order creation tests
```

---

## ✅ Definition of Done

A task is considered complete when:

- The feature is implemented.
- Business requirements are satisfied.
- Input validation is handled.
- Important error cases are handled.
- The feature has been manually tested.
- Relevant automated tests are added when appropriate.
- No obvious console or runtime errors remain.
- Documentation is updated when necessary.
- The related GitHub Issue is updated.
- The code is committed through the project's Git workflow.

---

## 📌 Development Principles

- Keep the system simple.
- Build according to real business needs.
- Avoid unnecessary complexity.
- Keep business logic inside the backend.
- Protect customer and business data.
- Validate all user input.
- Never store secrets in the repository.
- Use database migrations for schema changes.
- Keep the API documented.
- Prioritize customer experience.
- Prioritize real feedback over assumptions.
- Build features that can evolve with Torino.

---

## 💡 AI-Assisted Development

AI development tools are used during the project, especially for frontend
implementation, UI development, and repetitive tasks.

AI-generated code is reviewed and adapted before being integrated into the
project.

The business logic, architecture, database design, API contracts, and final
technical decisions remain controlled by the project developer.

---

## 📚 Documentation

Planned documentation lives in `docs/`:

```text
docs/
├── business-requirements.md
├── technical-specification.md
├── database-design.md
├── api-overview.md
└── deployment.md
```

---

## 🤝 Project

Built for **Torino Dessert** as part of the brand's initial digital launch.

The project is being developed as part of an initial collaboration to help
Torino establish its digital presence and build a foundation that can grow with
the business.