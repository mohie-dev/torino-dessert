# Torino Dessert

> Brand Website & Ordering Management System for Torino Dessert.

Torino Dessert is a growing dessert brand based in Mansoura, Egypt.

This project is being built to give Torino a professional digital presence
while providing a simple ordering and management system that can support
the business as it grows.

The system combines a customer-facing brand website with an internal
admin dashboard for managing products, orders, customers, and basic
business insights.

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

## ✨ Core Features

### 🌐 Customer Website

The customer-facing website will include:

- Home Page
- Torino Brand Identity
- About Torino
- Product Catalog
- Product Categories
- Product Details
- Shopping Cart
- Checkout
- Order Confirmation
- Order Status
- Contact Us
- Social Media Links
- Responsive Design

The website will focus on both **brand presentation** and **customer
experience**, rather than functioning as a simple online menu.

---

### 🛒 Ordering System

Customers will be able to:

1. Browse Torino products.
2. Open product details.
3. Add products to the cart.
4. Adjust quantities.
5. Review their order.
6. Provide their contact and delivery information.
7. Submit the order.
8. Receive an order reference.
9. Follow the order status.

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
````

An order can also be marked as:

```text
Cancelled
```

The initial version will focus on a simple ordering experience without
requiring customers to create an account.

---

## 🧑‍💼 Admin Dashboard

The admin dashboard will provide the Torino team with a simple way to
manage the daily operation of the business.

### Orders

* View incoming orders.
* Search and filter orders.
* View complete order details.
* View customer information.
* Update order status.
* Track completed and cancelled orders.

### Products

* Add products.
* Edit products.
* Update prices.
* Upload product images.
* Assign categories.
* Enable or disable product availability.

### Categories

* Create categories.
* Edit categories.
* Remove categories.
* Organize products.

### Customers

The system will keep customer information associated with their orders
and provide basic customer insights over time.

### Dashboard

The dashboard will provide a simple overview of the business, including:

* Today's orders.
* Today's sales.
* Pending orders.
* Completed orders.
* Total orders.
* Basic sales statistics.

---

## 📊 Business Insights

One of the important goals of the system is to start collecting useful
business data from the first real orders.

Over time, Torino will be able to understand:

* Total number of orders.
* Total sales.
* Average order value.
* Completed orders.
* Cancelled orders.
* Most requested products.
* Sales over a specific period.
* Order trends over time.

These insights can help the team understand the growth of the business
and make better decisions.

The collected data can also be useful when presenting Torino's activity
and growth to potential suppliers or business partners.

---

## 🏗️ Technical Direction

The project will start as a **simple modular application** focused on
maintainability and fast development.

The goal is not to introduce unnecessary infrastructure or complexity
during the MVP stage.

### Backend

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT Authentication
* REST API
* Swagger / OpenAPI
* class-validator
* class-transformer

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

Additional frontend libraries may be introduced when they provide clear
value to the project.

### Storage

Product images and other uploaded assets may use an
S3-compatible object storage service.

---

## 🧱 Architecture Approach

The initial system will follow a **modular monolith** approach.

```text
                    ┌──────────────────────┐
                    │   Customer Website   │
                    │       Next.js        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │      NestJS API      │
                    │                      │
                    │  Auth                │
                    │  Products            │
                    │  Categories          │
                    │  Customers           │
                    │  Orders              │
                    │  Dashboard           │
                    │  Reports             │
                    │  Settings            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    └──────────────────────┘
```

The architecture will remain intentionally simple during the MVP.

Infrastructure decisions will be based on actual project requirements
rather than introducing technologies that are not currently needed.

---

## 🗂️ Initial Backend Modules

The backend is expected to contain modules such as:

```text
src/
├── auth/
├── users/
├── products/
├── categories/
├── customers/
├── orders/
├── dashboard/
├── reports/
├── settings/
└── common/
```

The exact structure may evolve during implementation as the domain
model becomes clearer.

---

## 🗄️ Initial Domain

The initial database design is expected to include concepts such as:

```text
AdminUser
Category
Product
Customer
Order
OrderItem
StoreSettings
```

The final database structure will be defined during the
**ERD & Database Design** phase.

---

## 🚧 MVP Scope

The first release focuses on the most important workflows.

### Included

* Brand Website
* Product Catalog
* Product Details
* Shopping Cart
* Checkout
* Customer Orders
* Order Management
* Product Management
* Category Management
* Admin Authentication
* Basic Dashboard
* Basic Business Reports
* Customer Data

### Not Included in the Initial MVP

The following features may be considered in future versions:

* Online Payments
* Customer Accounts
* Loyalty Program
* Coupons
* Advanced Inventory Management
* Supplier Management
* Multiple Branches
* Map-based Delivery Tracking
* WhatsApp API Automation
* Advanced Notification Systems

These features are intentionally outside the initial scope so the
project can focus on the core business experience and launch quickly.

---

## 🗺️ Development Roadmap

The initial MVP is planned to be completed within approximately
**7–10 development days**, depending on feedback and final requirements.

### Phase 1 — Backend Foundation

* Project setup
* Database design
* ERD
* Authentication
* Products
* Categories
* Customers
* Orders
* Order lifecycle
* Dashboard statistics
* Reports
* API documentation

---

### Phase 2 — Customer Website

* Project layout
* Torino visual identity
* Home page
* Brand sections
* Product catalog
* Product details
* Cart
* Checkout
* Order confirmation
* Order tracking
* Contact section

---

### Phase 3 — Admin Dashboard

* Admin layout
* Orders management
* Products management
* Categories management
* Customer information
* Dashboard statistics
* Reports

---

### Phase 4 — Integration & Polish

* Frontend/API integration
* Loading states
* Empty states
* Error handling
* Responsive improvements
* Mobile testing
* Business flow testing

---

### Phase 5 — Feedback & Launch

* Internal testing
* Torino team testing
* Collect real feedback
* Fix business/UX issues
* Final UI polish
* Production deployment
* Final documentation

---

## 🗓️ Target Timeline

```text
Day 1–4
Backend & API

Day 5–8
Customer Website + Admin Dashboard

Day 9–10
Integration + Feedback + Final Polish
```

The timeline is a target rather than a strict deadline. Business feedback
or changes in requirements may affect the schedule.

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

## 📌 Issue-Driven Development

The project is managed through GitHub Issues.

Each issue should clearly define:

* What needs to be built.
* Why it is needed.
* Expected behavior.
* Acceptance criteria.
* Related technical considerations.

Example:

```text
Issue: Implement Order Creation

Goal:
Allow customers to submit an order from the checkout page.

Acceptance Criteria:
- Customer can submit valid order data.
- Products are validated.
- Product availability is checked.
- Order items are stored.
- Product prices are captured at order time.
- Order total is calculated correctly.
- A unique order reference is generated.
- Invalid requests return proper validation errors.
```

---

## ✅ Definition of Done

A task is considered complete when:

* The feature is implemented.
* Business requirements are satisfied.
* Input validation is handled.
* Important error cases are handled.
* The feature has been manually tested.
* Relevant automated tests are added when appropriate.
* No obvious console or runtime errors remain.
* Documentation is updated when necessary.
* The related GitHub Issue is updated.
* The code is committed through the project's Git workflow.

---

## 🔐 Development Principles

The project follows these principles:

* Keep the system simple.
* Build according to real business needs.
* Avoid unnecessary complexity.
* Keep business logic inside the backend.
* Protect customer and business data.
* Validate all user input.
* Never store secrets in the repository.
* Use database migrations for production changes.
* Keep the API documented.
* Prioritize customer experience.
* Prioritize real feedback over assumptions.
* Build features that can evolve with Torino.

---

## 💡 AI-Assisted Development

AI development tools may be used during the project, especially for
frontend implementation, UI development, repetitive tasks, and
development assistance.

AI-generated code will be reviewed and adapted before being integrated
into the project.

The business logic, architecture, database design, API contracts, and
final technical decisions remain controlled by the project developer.

---

## 📚 Documentation

Project documentation will be maintained throughout development.

Planned documentation includes:

```text
docs/
├── business-requirements.md
├── technical-specification.md
├── database-design.md
├── api-overview.md
└── deployment.md
```

---

## 🚀 Project Status

> 🚧 **MVP — In Development**

Current focus:

```text
Business Requirements
        ↓
ERD & Database Design
        ↓
Backend Development
        ↓
Frontend Development
        ↓
Integration
        ↓
Client Feedback
        ↓
MVP Release
```

---

## 🤝 Project

Built for **Torino Dessert** as part of the brand's initial digital
launch.

The project is being developed as part of an initial collaboration to
help Torino establish its digital presence and build a foundation that
can grow with the business.
