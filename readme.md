# FixItNow — Home Services Marketplace API

Backend-only REST API for a home-services booking marketplace. Customers browse and book services, technicians manage their offerings and bookings, admins oversee the platform. Real Stripe payment integration.

## Tech Stack

- Node.js + Express + TypeScript (ESM)
- PostgreSQL + Prisma ORM 7
- JWT auth (HttpOnly cookies)
- Stripe (Checkout Sessions + webhooks)
- Zod validation

## Roles

| Role | Can do |
|---|---|
| CUSTOMER | Browse services, book, pay, cancel own bookings, review completed bookings |
| TECHNICIAN | Manage profile, create/manage own services, accept/decline bookings |
| ADMIN | Manage categories, manage users (ban/unban), view all bookings + platform stats |

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in real values
npx prisma migrate dev
npx prisma db seed     # creates the admin user
npm run dev
```

## Environment Variables

| Key | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` (local) or your Stripe Dashboard webhook (deployed) |
| `CLIENT_URL` | Used for Stripe checkout success/cancel redirects and CORS origin |
| `PORT` | Default `5000` |
| `NODE_ENV` | `development` / `production` |
| `SEED_ADMIN_EMAIL` | (optional) overrides the default seeded admin email |
| `SEED_ADMIN_PASSWORD` | (optional) overrides the default seeded admin password |

## Admin Credentials (seeded)

```
Email:    admin@fixitnow.com
Password: Admin@1234
```

> Override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars before seeding, if you want different credentials for submission.

## Testing the Stripe Webhook Locally

```bash
stripe login
stripe listen --forward-to localhost:5000/api/webhook/stripe
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

## API Documentation

Published docs: [https://documenter.getpostman.com/view/55078120/2sBY4LRhcR](https://documenter.getpostman.com/view/55078120/2sBY4LRhcR)

## Deployed URL

[https://fixitnow-backend-d2kr.onrender.com/](https://fixitnow-backend-d2kr.onrender.com/)

> **Note:** Hosted on Render's free tier — the first request after inactivity may take 30–50 seconds to respond while the server wakes up.
