# DevLog Backend — REST API

> Express.js + Prisma + PostgreSQL backend for DevLog, a developer daily standup tracker SaaS.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Email System](#email-system)
- [Scheduled Jobs](#scheduled-jobs)
- [Project Structure](#project-structure)

---

## 📖 Overview

This is the backend REST API for DevLog. It handles:

- Authentication via Better Auth (JWT + refresh tokens)
- Standup log with streak tracking
- Workspace and team management
- Email invite system
- Stripe payment integration
- Automated weekly reports via node-cron
- Cloudinary image uploads for blocker screenshots and user avatar

**Frontend Repo** → [devlog-frontend](https://github.com/Musfique55/devlog-frontend)  
**Live API** → `https://devlog-backend-ruddy.vercel.app/api/v1`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Runtime and framework |
| TypeScript | Language |
| Prisma | ORM |
| PostgreSQL | Database |
| Better Auth | Authentication |
| Nodemailer + EJS | Email system |
| Stripe | Payment processing |
| Cloudinary | File/image storage |
| node-cron | Scheduled jobs |
| tsup | Build tool |
| tsx | Development runner |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (test mode)
- Cloudinary account
- SMTP email credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/Musfique55/devlog-backend.git
cd devlog-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Scripts

```bash
npm run dev      # Start development server with tsx watch
npm run build    # Build for production with tsup
npm run start    # Start production server
npm run generate # Generate Prisma client
npm run migrate  # Run Prisma migrations
npm run studio   # Open Prisma Studio
npm run seed:admin # Seed super admin user
npm run stripe:webhook # Forward Stripe webhooks to /webhook
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devlog
PORT=5000
NODE_ENV=development

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:5000

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Admin seed
ADMIN_USERNAME=superadmin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (SMTP sender)
EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=587
EMAIL_SENDER_SMTP_USER=your_email@gmail.com
EMAIL_SENDER_SMTP_PASSWORD=your_app_password
```

---

## 🗄️ Database Schema

### Models
| Model | Description |
|---|---|
| `User` | Platform users with role and plan |
| `Workspace` | Team container created by Pro users |
| `WorkspaceMember` | Junction table between User and Workspace |
| `StandupLogs` | Daily standup entries |
| `Invite` | Workspace invite tokens |
| `Payment` | Stripe payment records |

### Enums
```prisma
enum APP_ROLE      { SUPER_ADMIN  USER }
enum PLAN          { FREE  PRO }
enum TEAM_ROLE     { ADMIN  MEMBER }
enum InviteStatus  { PENDING  ACCEPTED  EXPIRED }
enum PaymentStatus { PENDING  SUCCESS  FAILED }
enum BlockerStatus { OPEN  RESOLVED }
```

---

## 📡 API Routes

### API Base
All app APIs are mounted under:
```
/api/v1
```

### Better Auth Internal Routes
Better Auth is mounted under:
```
/api/auth/*
```

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
```

### Users
```
GET    /api/v1/users/me
PATCH  /api/v1/users
DELETE /api/v1/users/delete-account
```

### Standup Logs
```
POST   /api/v1/logs
GET    /api/v1/logs
GET    /api/v1/logs/:id
PATCH  /api/v1/logs/:id
DELETE /api/v1/logs/:id
GET    /api/v1/logs/workspaces/:workspaceId
GET    /api/v1/logs/workspaces/:workspaceId/blocker/:blocker
PATCH  /api/v1/logs/workspaces/:workspaceId/blocker/:id
DELETE /api/v1/logs/workspaces/:workspaceId/:id
```

### Workspaces
```
GET    /api/v1/workspaces/me
GET    /api/v1/workspaces/me/stats
GET    /api/v1/workspaces/:workspaceId
GET    /api/v1/workspaces/:workspaceId/members
GET    /api/v1/workspaces/:workspaceId/stats
POST   /api/v1/workspaces                         # Pro only
POST   /api/v1/workspaces/:workspaceId/invite     # Pro + Admin
PATCH  /api/v1/workspaces/:workspaceId
DELETE /api/v1/workspaces/:workspaceId
DELETE /api/v1/workspaces/:workspaceId/remove-member
```

### Invites
```
GET    /api/v1/invites/accept/:token
```

### Dashboard
```
GET    /api/v1/dashboard/me
GET    /api/v1/dashboard/workspaces/:workspaceId
```

### Payments
```
POST   /api/v1/payments/create-checkout-session
GET    /api/v1/payments/:transactionId
POST   /webhook
```

### Admin
```
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/dashboard/yearly-profit
GET    /api/v1/admin/dashboard/user-growth
GET    /api/v1/admin/workspaces
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/:userId
```

---

## 📧 Email System

All templates are EJS files located in `src/app/templates/`:

| Template | Trigger |
|---|---|
| `emailVerify.ejs` | On user registration |
| `invite.ejs` | Workspace invite sent by admin |
| `blocker.ejs` | Member reports a blocker in standup |
| `blocker-resolved.ejs` | Admin marks blocker as resolved |
| `weekly-report.ejs` | Every Friday at 9am via cron |
| `payment-success.ejs` | After successful Stripe payment |
| `subscription-expired.ejs` | When Pro subscription expires |

---

## ⏰ Scheduled Jobs

| Job | Schedule | Description |
|---|---|---|
| Invite Expiry Check | Every midnight | Marks expired invite tokens |
| Weekly Report | Every Friday 9am | Sends team digest to all workspace admins |
| Subscription Check | 11:59 PM daily | Downgrades expired Pro subscriptions to Free |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── config/
│   │   ├── env.ts                  # Environment variables
│   │   ├── multer.config.ts        # Multer + Cloudinary config
│   │   └── stripe.config.ts        # Stripe instance
│   ├── helper/
│   │   └── AppError.ts             # Custom error class
│   ├── middleware/
│   │   ├── checkAuth.ts            # JWT + Better Auth middleware
│   │   ├── teamAuth.ts             # Workspace role middleware
│   │   ├── requiredPro.ts          # Plan check middleware
│   │   ├── prismaErrorHandler.ts   # Prisma error handler
│   │   └── globalErrorHandler.ts   # Global error handler
│   ├── module/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── workspace/
│   │   ├── standupLogs/
│   │   ├── invite/
│   │   ├── checkout/
│   │   ├── payment/
│   │   └── dashboard/
│   ├── templates/
│   │   ├── emailVerify.ejs
│   │   ├── invite.ejs
│   │   ├── blocker.ejs
│   │   ├── blocker-resolved.ejs
│   │   ├── weekly-report.ejs
│   │   ├── payment-success.ejs
│   │   └── subscription-expired.ejs
│   └── utils/
│       ├── queryBuilder.ts         # Reusable Prisma query builder
│       ├── sendEmail.ts            # Nodemailer helper
│       ├── tokenUtils.ts           # JWT helpers
│       ├── sendResponse.ts         # Standard API response
│       ├── catchAsync.ts           # Async error wrapper
│       └── getWeekRange.ts         # Weekly date range helper
├── generated/prisma/               # Generated Prisma client
├── lib/
│   ├── auth.ts                     # Better Auth instance
│   └── prisma.ts                   # Prisma client instance
└── server.ts                       # App server entry point
```

---

## 🔐 Roles & Permissions

### Platform Level
| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full platform access — users, workspaces, stats |
| `USER` | Personal logs, join workspaces, upgrade to Pro |

### Workspace Level
| Role | Access |
|---|---|
| `ADMIN` | Manage members, resolve blockers, view team feed |
| `MEMBER` | Submit standups, view team feed |

### Plan Level
| Feature | FREE | PRO |
|---|---|---|
| Solo standup logging | ✅ | ✅ |
| Streak tracking | ✅ | ✅ |
| Join workspaces | ✅ | ✅ |
| Log history | 30 days | Unlimited |
| Create workspaces | ❌ | ✅ |
| Invite members | ❌ | ✅ |
| Blocker alerts | ❌ | ✅ |
| Weekly reports | ❌ | ✅ |

---

## 💳 Test Payment

```
Card Number : 4242 4242 4242 4242
Expiry      : Any future date
CVC         : Any 3 digits
```

---

<div align="center">
  <p>
    <a href="https://github.com/Musfique55/devlog-frontend">Frontend Repo</a> •
    <a href="https://devlog-frontend-two.vercel.app/">Live Demo</a>
  </p>
</div>
