# Finance Dashboard API

I built this as a backend assignment — a REST API for a finance dashboard where different users can interact with financial data based on their role. Admins manage everything, analysts can view data and trends, and viewers get read-only access to the dashboard.

The stack is Node.js, Express, and MongoDB. I tried to keep the architecture clean and practical rather than over-engineered.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB — local or [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Clone the repo
```bash
git clone 
cd finance-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Open `.env` and fill in your values:
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

### 4. Seed the database

This creates 3 users (one per role) and 20 financial records spread across the last 6 months so you have real data to explore right away:
```bash
npm run seed
```

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | admin@test.com     | Admin1234   |
| Analyst | analyst@test.com   | Analyst1234 |
| Viewer  | viewer@test.com    | Viewer1234  |

### 5. Start the server
```bash
npm run dev
```

You'll see this in the terminal:

    Server:    http://localhost:5000     
    API Docs:  http://localhost:5000/api-docs

### 6. Explore the API

Open **http://localhost:5000/api-docs** in your browser. This is a fully interactive Swagger UI where you can see every endpoint, read the request/response shapes, and test everything live.

To test protected endpoints in the docs:
1. Hit `POST /api/auth/login` with one of the seed credentials above
2. Copy the token from the response
3. Click the **Authorize** button at the top right of the page
4. Paste the token and click Authorize

Every subsequent request in the UI will automatically include the token.

---

## Running Tests
```bash
npm test
```

Tests use a separate test database and clean up after themselves. There are 21 tests across auth, records, and dashboard:
Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total

---

## Project Structure

I went with a layered architecture — routes handle HTTP, controllers handle request/response, services handle business logic and DB queries. It keeps each layer focused and independently testable.
src/
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── roles.js              # Role constants and permission matrix
│   └── swagger.js            # Swagger/OpenAPI configuration
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── record.controller.js
│   └── dashboard.controller.js
├── middleware/
│   ├── authenticate.js       # Verifies JWT, attaches req.user
│   ├── authorize.js          # requireRole, requireMinRole, requirePermission
│   ├── rateLimiter.js        # Global and auth-specific rate limits
│   └── validate.js           # Formats express-validator errors
├── models/
│   ├── User.js
│   └── FinancialRecord.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── record.routes.js
│   └── dashboard.routes.js
├── services/
│   ├── auth.service.js       # Token generation, password helpers
│   ├── user.service.js       # User DB operations
│   ├── record.service.js     # Record DB operations, soft delete logic
│   └── dashboard.service.js  # MongoDB aggregation pipelines
├── utils/
│   └── apiResponse.js        # Shared sendSuccess / sendError helpers
├── validators/
│   ├── auth.validator.js
│   ├── user.validator.js
│   └── record.validator.js
└── app.js
tests/
├── auth.test.js
├── record.test.js
└── dashboard.test.js
seed.js
server.js

---

## Tech Stack

| Area           | Technology                          |
|----------------|-------------------------------------|
| Runtime        | Node.js v18+                        |
| Framework      | Express.js v5                       |
| Database       | MongoDB with Mongoose               |
| Authentication | JSON Web Tokens (JWT)               |
| Validation     | express-validator                   |
| Security       | helmet, bcryptjs, express-rate-limit|
| Logging        | morgan                              |
| Docs           | Swagger UI (swagger-jsdoc)          |
| Testing        | Jest + Supertest                    |

---

## Role Permissions

There are three roles. Here's exactly what each one can do:

| Action                 | Viewer | Analyst | Admin |
|------------------------|:------:|:-------:|:-----:|
| View records           | ✓      | ✓       | ✓    |
| View dashboard summary | ✓      | ✓       | ✓    |
| View trends            |        | ✓       | ✓     |
| Create records         |        |         | ✓     |
| Update records         |        |         | ✓     |
| Delete records         |        |         | ✓     |
| Manage users           |        |         | ✓     |

Permissions are defined in a single matrix in `src/config/roles.js`. Routes declare what permission they need — they don't contain any role logic themselves. This means if I ever need to change what an analyst can do, there's exactly one place to update it.

---

## API Overview

All protected routes need this header:
Authorization: Bearer <your_token>

Every response — success or error — follows the same shape:
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

Errors look like this:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

### Auth

| Method | Endpoint            | Auth | Description          |
|--------|---------------------|------|----------------------|
| POST   | /api/auth/register  | No   | Register a new user  |
| POST   | /api/auth/login     | No   | Login, receive token |

**Register**
```json
{
  "name": "Shishir Dhasmana",
  "email": "shishirdhasmana@example.com",
  "password": "Password123",
  "role": "viewer"
}
```

**Login**
```json
{
  "email": "shishirdhasmana@example.com",
  "password": "Password123"
}
```

Password rules: minimum 8 characters, at least one uppercase letter, at least one number.

---

### Users — Admin only

| Method | Endpoint         | Description            |
|--------|------------------|------------------------|
| GET    | /api/users       | List users             |
| GET    | /api/users/:id   | Get a single user      |
| POST   | /api/users       | Create a user          |
| PATCH  | /api/users/:id   | Update role or status  |
| DELETE | /api/users/:id   | Delete a user          |

Filtering and pagination on `GET /api/users`:
/api/users?role=analyst&status=active&page=1&limit=10

A few guard rails I added: admins can't deactivate or delete their own account, and email can't be updated after registration since it's used as an identity field.

---

### Financial Records

| Method | Endpoint           | Role  | Description         |
|--------|--------------------|-------|---------------------|
| GET    | /api/records       | Any   | List records        |
| GET    | /api/records/:id   | Any   | Get a single record |
| POST   | /api/records       | Admin | Create a record     |
| PATCH  | /api/records/:id   | Admin | Update a record     |
| DELETE | /api/records/:id   | Admin | Soft delete         |

Records support filtering by multiple criteria at once:
/api/records?type=expense&category=rent&from=2024-01-01&to=2024-12-31&page=1&limit=10

Category matching is case-insensitive, so `?category=Rent` and `?category=rent` return the same results.

Deleting a record doesn't actually remove it from the database — it sets a `deletedAt` timestamp instead. This keeps the financial history intact and makes data recoverable if something is deleted by mistake.

**Create record body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-01-01",
  "notes": "January salary"
}
```

---

### Dashboard

| Method | Endpoint                | Role           | Description                    |
|--------|-------------------------|----------------|--------------------------------|
| GET    | /api/dashboard/summary  | Any            | Totals, breakdown, recent      |
| GET    | /api/dashboard/trends   | Analyst, Admin | Income vs expense over time    |

**Summary response shape:**
```json
{
  "summary": {
    "income": 5800,
    "expense": 1550,
    "netBalance": 4250,
    "incomeCount": 2,
    "expenseCount": 3,
    "avgIncome": 2900.00,
    "avgExpense": 516.67
  },
  "categoryBreakdown": {
    "income": [
      { "category": "salary",    "total": 5000, "count": 1 },
      { "category": "freelance", "total": 800,  "count": 1 }
    ],
    "expense": [
      { "category": "rent", "total": 1200, "count": 1 },
      { "category": "food", "total": 350,  "count": 2 }
    ]
  },
  "recentRecords": []
}
```

**Trends** — returns income and expense side by side per period so a chart can consume it directly:
/api/dashboard/trends?period=monthly&year=2026
/api/dashboard/trends?period=weekly&year=2026
```json
{
  "period": "monthly",
  "trends": [
    { "period": "2026-01", "income": 5000, "expense": 1450, "net": 3550 },
    { "period": "2026-02", "income": 800,  "expense": 100,  "net": 700  }
  ]
}
```

---

## Security

A few things I was deliberate about on the security side:

**Passwords** are hashed with bcryptjs at cost factor 12 inside a Mongoose pre-save hook. The password field has `select: false` on the model so it can never accidentally end up in a response — you have to explicitly opt in with `.select('+password')` which only happens during login.

**JWT verification** fetches the user fresh from the database on every request. This means if an admin deactivates a user, their token stops working immediately even if it hasn't expired yet.

**Login errors** are intentionally vague — the API returns the same message whether the email doesn't exist or the password is wrong. This prevents an attacker from figuring out which emails are registered.

**Rate limiting** is split into two tiers — 100 requests per 15 minutes globally, and a stricter 10 requests per 15 minutes on auth routes specifically to slow down brute force attempts.

**Helmet** sets a standard set of secure HTTP headers on every response.

---

## Design Decisions and Tradeoffs

A few things I made deliberate choices about:

**Why a service layer?** I could have put the DB queries directly in the controllers but that would make them hard to test and hard to reuse. Services let controllers stay thin — they just handle HTTP — while all the actual logic lives in one testable place.

**Why a permission matrix instead of role checks?** Scattering `if (role === 'admin')` checks across controllers works but becomes a maintenance problem fast. A single matrix in `roles.js` means there's one place to look and one place to change when requirements shift.

**Why soft deletes on records?** Financial data should never be hard deleted. Setting `deletedAt` instead of removing the document means the history is always there, deleted records don't affect dashboard totals, and mistakes are recoverable. A Mongoose query helper `.active()` makes sure deleted records are automatically excluded from every query without having to remember to add the filter manually.

**Why `Promise.all` in the dashboard service?** The summary endpoint runs three separate aggregation pipelines. Running them in parallel instead of sequentially cuts the response time roughly in thirds for that endpoint.

---

## Assumption
- Email is treated as immutable after registration. It's used as a unique identity field and changing it would require additional verification logic that's outside the scope of this assignment.
- The `role` field can be set at registration to make testing easier. In a real production system this would typically be an admin-only action.
- Rate limiting uses in-memory storage which resets if the server restarts. A production deployment with multiple instances would need a Redis-backed store instead.
- Soft-deleted records are permanently excluded from all listings and dashboard calculations. There's no restore endpoint — that would be a natural next addition.