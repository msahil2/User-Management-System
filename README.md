# 🛡️ User Management System (MERN + RBAC)

A production-ready full-stack User Management System built with the MERN stack, featuring JWT authentication and role-based access control (RBAC).

Frontend: https://user-management-system-rfq7.vercel.app  
Backend: https://user-management-system-qoag.onrender.com

---

## 📁 Project Structure

```
user-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js     # Login, logout, refresh, me
│   │   └── user.controller.js     # CRUD for users
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication middleware
│   │   ├── rbac.js                # Role-based authorization middleware
│   │   ├── validate.js            # Input validation (express-validator)
│   │   └── errorHandler.js        # Centralized error + 404 handler
│   ├── models/
│   │   └── User.js                # Mongoose schema with audit fields
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth/*
│   │   └── user.routes.js         # /api/users/*
│   ├── services/
│   │   ├── auth.service.js        # Business logic for auth
│   │   └── user.service.js        # Business logic for users
│   ├── utils/
│   │   ├── jwt.js                 # Token generation & verification
│   │   ├── response.js            # Standardized API responses
│   │   └── seeder.js              # Seeds admin user
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── ProtectedRoute.jsx   # Auth & role guard
        │   │   └── UI.jsx               # Badge, Button, Input, Modal, etc.
        │   └── layout/
        │       ├── Navbar.jsx           # Role-based navigation bar
        │       └── Layout.jsx           # Page wrapper
        ├── context/
        │   ├── AuthContext.jsx          # Global auth state
        │   └── UserContext.jsx          # Global user list state
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── UserListPage.jsx         # Admin/Manager
        │   ├── UserDetailPage.jsx       # With audit trail display
        │   ├── UserFormPage.jsx         # Create & Edit
        │   └── MyProfilePage.jsx
        ├── services/
        │   └── api.js                   # Axios + interceptors
        ├── styles/
        │   └── global.css
        ├── App.jsx                      # Routes
        └── index.js
```

---

## 🗄️ MongoDB User Schema

```js
{
  name:         String   // required, 2–50 chars
  email:        String   // required, unique, lowercase
  password:     String   // bcrypt hashed, select: false
  role:         String   // enum: 'admin' | 'manager' | 'user'
  isActive:     Boolean  // default: true
  isDeleted:    Boolean  // soft delete flag, default: false
  deletedAt:    Date
  deletedBy:    ObjectId → User
  refreshToken: String   // select: false
  lastLoginAt:  Date

  // ── Audit Trail ──────────────────────────────────────
  createdBy:    ObjectId → User   // set on creation
  updatedBy:    ObjectId → User   // updated on every save

  // ── Mongoose timestamps ───────────────────────────────
  createdAt:    Date    // auto-managed
  updatedAt:    Date    // auto-managed
}
```

---

## 🔐 Authorization Rules

| Action                       | Admin | Manager | User |
|------------------------------|:-----:|:-------:|:----:|
| View all users               |  ✅   |   ✅    |  ❌  |
| View own profile             |  ✅   |   ✅    |  ✅  |
| Create users                 |  ✅   |   ❌    |  ❌  |
| Update any user (non-admin)  |  ✅   |   ✅    |  ❌  |
| Update own profile           |  ✅   |   ✅    |  ✅  |
| Assign/change roles          |  ✅   |   ❌    |  ❌  |
| Soft delete users            |  ✅   |   ❌    |  ❌  |
| Update admin users           |  ✅   |   ❌    |  ❌  |

---

## 📡 API Routes

### Auth Routes — `/api/auth`

| Method | Endpoint         | Access  | Description               |
|--------|------------------|---------|---------------------------|
| POST   | `/auth/login`    | Public  | Authenticate, get tokens  |
| POST   | `/auth/refresh`  | Public  | Refresh access token      |
| POST   | `/auth/logout`   | Private | Invalidate refresh token  |
| GET    | `/auth/me`       | Private | Get current user profile  |

### User Routes — `/api/users`

| Method | Endpoint         | Access          | Description                      |
|--------|------------------|-----------------|----------------------------------|
| GET    | `/users`         | Admin, Manager  | List users (pagination+filter)   |
| POST   | `/users`         | Admin           | Create a new user                |
| GET    | `/users/me`      | All             | Get own profile                  |
| GET    | `/users/:id`     | Admin/Mgr/Self  | Get single user with audit trail |
| PUT    | `/users/:id`     | Admin/Mgr/Self  | Update user (role-restricted)    |
| DELETE | `/users/:id`     | Admin           | Soft delete / deactivate         |

### Query Parameters for `GET /api/users`

| Param     | Type    | Description                       |
|-----------|---------|-----------------------------------|
| page      | number  | Page number (default: 1)          |
| limit     | number  | Results per page (default: 10)    |
| search    | string  | Search name or email              |
| role      | string  | Filter by role                    |
| isActive  | boolean | Filter by active status           |
| sort      | string  | Sort field (default: -createdAt)  |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### Backend Setup

```bash
# 1. Navigate to backend
cd user-management-system/backend
# 2. Install dependencies
npm install
# 3. Create environment file
cp .env.example .env
# 5. Seed the admin user
npm run seed
# 6. Start development server
npm run dev
# Production start
npm start
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd user-management-system/frontend
# 2. Install dependencies
npm install
# 3. Create environment file
cp .env.example .env
# 4. Start development server
npm start
# Production build
npm run build
```

---

### Default Login Credentials

```
Email:    admin@example.com
Password: Admin@123
Role:     Admin
```
> ⚠️ **Change the admin password immediately after first login!**

---

## 🚀 Deployment

### Backend → Render

1. Push your backend to a GitHub repository
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables in the Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=<your MongoDB Atlas URI>
   JWT_SECRET=<strong random secret>
   JWT_REFRESH_SECRET=<another random secret>
   CLIENT_URL=https://user-management-system-rfq7.vercel.app
   PORT=5000
   BCRYPT_SALT_ROUNDS=12
6. Deploy. Note your backend URL: `https://user-management-system-qoag.onrender.com`
7. Seed admin via Render Shell: `npm run seed`

### Frontend → Vercel

1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend/`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=Backend: https://user-management-system-qoag.onrender.com/api
   ```
5. Deploy!
## 🔒 Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** access tokens (15 min) + refresh tokens (7 days)
- **Refresh token rotation** — invalidated on each refresh
- **Helmet** — HTTP security headers
- **Rate limiting** — 100 req/15min globally, 20 req/15min on auth routes
- **CORS** — restricted to CLIENT_URL
- **Input validation** — express-validator on all routes
- **Password never returned** — `select: false` on schema
- **Soft delete** — user data preserved, account deactivated
- **Centralized error handling** — no stack traces in production

---

## 🧰 Tech Stack Summary

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Frontend    | React 18, React Router v6, Axios    |
| State       | Context API + useReducer            |
| Backend     | Node.js, Express                    |
| Database    | MongoDB, Mongoose                   |
| Auth        | JWT (access + refresh tokens)       |
| Security    | bcryptjs, Helmet, express-rate-limit|
| Validation  | express-validator                   |
| Styling     | Pure CSS (custom design system)     |
