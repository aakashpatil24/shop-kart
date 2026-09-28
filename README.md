# 🛒 ShopCart — Full-Stack E-Commerce App

React (TypeScript) storefront + Express/MongoDB API, with JWT auth (access/refresh
rotation) and full product CRUD including live stock management.

> Built by **Aakash Patil**

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Backend Features](#backend-features)
- [Frontend Features](#frontend-features)
- [API Reference](#api-reference)
- [Auth Flow](#auth-flow)
- [Security Checklist](#security-checklist)
- [Not Implemented](#not-implemented)

## Tech Stack

| | |
|---|---|
| **Backend** | Node.js, Express 4, TypeScript, MongoDB + Mongoose, JWT, bcrypt, express-validator, helmet, cors, morgan, express-rate-limit |
| **Frontend** | React 19, Vite, TypeScript, Redux Toolkit, React Router 7, react-hook-form, axios, Tailwind CSS 4, toastify-js |

## Folder Structure

```
backend/src/
  server.ts, app.ts            entrypoint + express app/middleware wiring
  config/                      env validation, mongoose connection
  models/                      User, Product (mongoose schemas)
  controllers/, routes/        auth.*, product.*
  middlewares/                 authenticate, validate, errorHandler
  validators/                  express-validator chains
  utils/                       jwt, cookie, ApiError, asyncHandler

frontend/src/
  routes.tsx                   all <Route> definitions
  pages/                       Home, Login, Register, ProductDetail, Cart, Checkout,
                                OrderHistory, MyProducts, ProductForm
  components/                  Navbar, Footer, ProductCard, CartItem, ProtectedRoute
  context/AuthContext.tsx      in-memory access token + silent login
  lib/                         axios instance + interceptors, tokenStore
  services/                    auth.service.ts, product.service.ts
  app/                         Redux store — cartSlice (persisted per-user), productSlice
  types/api.ts                 types mirroring backend response contracts
```

## Setup

Requires Node 18+ and a MongoDB instance.

```bash
# backend
cd backend && npm install
cp .env.example .env      # set MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET
npm run dev                # http://localhost:5000

# frontend
cd frontend && npm install
cp .env.example .env      # set VITE_API_URL
npm run dev                 # http://localhost:5173
```

`npm run build` in each folder for production (`backend` → `dist/`, `frontend` →
`tsc -b && vite build` → `dist/`).

## Backend Features

**Auth** (`/api/auth`)
- Register / login with bcrypt-hashed passwords (12 rounds), strong password policy
- Access token (15m) + refresh token (7d, httpOnly cookie), **rotated on every refresh**
- Refresh tokens stored as SHA-256 hashes only; reuse of a rotated token revokes **all**
  sessions for that user
- Rate-limited login/register (10 req / 15 min / IP)
- `/me` returns the current authenticated user

**Products** (`/api/products`)
- Full CRUD, ownership-scoped: only a product's creator can update/delete it
- `GET /` supports pagination, title search (regex-escaped), category filter, and
  sort (`newest` / `price_asc` / `price_desc`)
- `PATCH /:id/stock` — atomically decrements stock by a given quantity; any
  authenticated user may call it (used at checkout), and it's guarded by a conditional
  `stock >= quantity` update so concurrent orders can never push stock negative
  (returns `409` if insufficient stock)

**Cross-cutting**: centralized `ApiError`/`asyncHandler`, express-validator on every
route, helmet + locked-down CORS, Mongo-injection-safe (`isMongoId()` on all `:id`
params), no stack traces leaked in production.

## Frontend Features

**Shopping**
- Product grid with search, category filter, sort, and skeleton loading states
- Product detail page with stock-aware "Add to Cart" (disabled + "Out of Stock" label
  when `stock <= 0`)
- Cart with quantity +/− controls **capped at the product's current stock** — the "+"
  button disables and shows a toast (`Only N in stock`) at the limit; the same cap
  applies at add-to-cart time
- 3-step checkout (shipping → payment → review). On placing an order, the frontend
  calls `PATCH /api/products/:id/stock` for every cart line **before** saving the
  order — if stock ran out in the meantime, the order is not saved, the cart is left
  intact, and the real backend error message is toasted to the user
- Order history persisted per-user in `localStorage` (no backend order model)

**Product Management** ("My Products" / "Sell an Item" — any authenticated user, not
admin-only, mirrors the backend's ownership model)
- Create (`/sell`) and edit (`/products/:id/edit`) share one form component; edit
  pre-fills via `GET /api/products/:id` and shows a permission error up front if the
  current user isn't the owner (mirrors the backend's 403)
- List own products, delete with confirmation

**Auth**
- Register/login forms with client-side validation matching backend rules
- Access token held in memory only (never `localStorage`) to limit XSS blast radius;
  refresh token lives in an httpOnly cookie
- Silent login on app mount (`/refresh-token` → `/me`); axios interceptor
  auto-refreshes once on a `401 TOKEN_EXPIRED` and retries the original request(s)
- Protected routes (`Cart`, `Checkout`, `Orders`, `My Products`, `Sell`) redirect to
  `/login` and return the user afterward

**Toasts**: success/error/warning/info feedback for every state-changing action —
login, logout, register, add/remove/clear cart, stock-limit blocks, order placed,
product create/update/delete.

## API Reference

Every response is `{ success, message, data? }` or `{ success: false, message, errors?, code? }`.

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ name, email, password, confirmPassword }` |
| POST | `/api/auth/login` | Public | `{ email, password }` → access token + refresh cookie |
| POST | `/api/auth/refresh-token` | Refresh cookie | Rotates refresh token, returns new access token |
| POST | `/api/auth/logout` | Authenticated | Revokes the current session's refresh token |
| GET | `/api/auth/me` | Authenticated | Current user |
| POST | `/api/products` | Authenticated | `{ title, description, price, stock, category, image? }` |
| GET | `/api/products` | Public | query: `page`, `limit`, `search`, `category`, `sort` |
| GET | `/api/products/:id` | Public | — |
| PUT | `/api/products/:id` | Owner only | any subset of the create fields |
| PATCH | `/api/products/:id/stock` | Authenticated | `{ quantity }` → decrements stock atomically |
| DELETE | `/api/products/:id` | Owner only | — |

## Auth Flow

Access token → in-memory (frontend), 15m expiry, signed with `ACCESS_TOKEN_SECRET`.
Refresh token → httpOnly cookie, 7d expiry, signed with a different secret, hashed
(SHA-256) before storage. Every refresh rotates the token (old hash deleted, new one
stored + cookied); if a client ever presents a hash that's no longer in the DB, that
signals token theft/replay, so **every** refresh token for that user is revoked.

## Security Checklist

- [x] bcrypt password hashing (12 rounds), passwords never returned by the API
- [x] Refresh tokens hashed at rest, httpOnly + secure (prod) + sameSite cookie
- [x] Rotation + reuse detection on refresh tokens
- [x] Access token never touches `localStorage`
- [x] Generic login error (no user enumeration)
- [x] helmet, CORS locked to `CLIENT_URL`, rate limiting on auth routes
- [x] express-validator on every route; `isMongoId()` on all `:id` params; search terms regex-escaped
- [x] Resource-level authorization (ownership) on product update/delete/stock
- [x] Atomic conditional update on stock decrement (race-safe against overselling)
- [x] No stack traces leaked when `NODE_ENV=production`

## Not Implemented

Scoped out of the original brief — left as-is rather than guessed:

- Real payment processing (checkout form is a UI simulation)
- Server-side order storage (orders live in `localStorage` only)
- Admin roles / seller approval (any authenticated user can list products)
- Product reviews/ratings, wishlists, email verification, password reset
