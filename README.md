# Charm & Grace Cosmetics Store

Charm & Grace is a full-stack cosmetics e-commerce application built as a modern React and TypeScript redevelopment of an original PHP/MySQL store. It includes a responsive customer storefront, a dedicated administration dashboard, authentication, checkout, real-time-style customer support, and a relational MySQL data layer.

The project was developed as a portfolio application with an emphasis on realistic shopping flows, accessible interactions, responsive layouts, and a consistent editorial beauty aesthetic across light and dark themes.

## Highlights

### Customer storefront

- Responsive landing page with curated collections and animated editorial sections
- Product catalogue with search, category filters, sorting, pagination, and a sticky filter panel
- Product detail pages with image galleries, shades, quantities, descriptions, reviews, and related products
- Shopping bag drawer, full cart, wishlist, and checkout flow
- Customer registration, email/password login, Google Sign-In, and sign-out
- Customer profile with account information and previous order history
- Newsletter subscription with a one-time `WELCOME10` offer per customer email
- Contact form and private customer/admin live chat
- FAQ, About, Blog, Blog Detail, Shipping & Returns, Privacy, and Terms pages
- Responsive navigation and full light/dark theme support

### Administration dashboard

- Separate administrator authentication and session storage
- Dashboard summaries and searchable resource pages
- Product creation and editing
- Order acceptance, rejection, status updates, and delivery management
- Management views for customers, reviews, brands, coupons, delivery methods, payment methods, and messages
- Customer live-chat inbox with read/unread state handling
- Responsive administration navigation with icons, user menu, theme control, and sign-out

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, React Router, Vite |
| Styling | Tailwind CSS 4, custom responsive styles, Lucide icons |
| Typography | Playfair Display Variable, Manrope Variable |
| Backend | Node.js, Express 5, TypeScript |
| Database | MySQL 8, `mysql2` connection pooling and transactions |
| Authentication | JSON Web Tokens, bcrypt, Google Identity Services |
| Validation | TypeScript builds and Oxlint |
| Deployment | Render Blueprint, Node web service, persistent MySQL service |

## Application architecture

The React frontend and Express API are developed together in this repository.

```text
cosmetics-ecom/
├── public/                    Static images and product assets
├── server/
│   ├── database/              Original MySQL schema and seed data
│   ├── middleware/            API authentication middleware
│   ├── routes/                Public, customer, admin, product, and auth routes
│   ├── scripts/               Guarded deployment database importer
│   ├── config.ts              Server environment configuration
│   ├── db.ts                  MySQL pool and transaction helper
│   └── index.ts               Express application entry point
├── src/
│   ├── components/
│   │   ├── admin/             Administration interface
│   │   ├── auth/              Google authentication component
│   │   ├── layouts/           Navigation, footer, and shared layouts
│   │   ├── pages/             Storefront and account pages
│   │   ├── store/             Reusable commerce components
│   │   └── support/           Customer support and chat UI
│   ├── config/                Storefront navigation configuration
│   ├── data/                  Typed fallback catalogue data
│   ├── lib/                   API and session utilities
│   ├── routes.tsx             Customer and admin route definitions
│   └── main.tsx               React entry point
├── render.yaml                Render deployment Blueprint
└── vite.config.ts             Vite and Tailwind configuration
```

During local development, Vite and Express run as separate processes. In production, Express serves the built React application and the API from the same origin. This avoids production CORS and session-routing problems while preserving React Router deep links.

## Local development

### Requirements

- Node.js 24 or a compatible current Node.js release
- npm
- MySQL 8

### 1. Clone and install

```bash
git clone https://github.com/ThiriWinyati/cosmetics-ecom-react.git
cd cosmetics-ecom-react
npm install
```

### 2. Configure the environment

Copy `.env.example` to `.env` and update the values for your machine.

```bash
cp .env.example .env
```

```dotenv
API_PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cosmetics_store

VITE_API_URL=http://localhost:4000/api
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
```

Never commit `.env`. The repository ignores local environment files, and `.env.example` contains placeholders only.

### 3. Create and import the database

Create a MySQL database named `cosmetics_store`, then import the included schema and seed data:

```bash
npm run db:import
```

The command prompts for the local MySQL root password. The source dump is located at `server/database/cosmetics_store.sql`.

### 4. Start the application

```bash
npm run dev
```

This starts:

- Customer/admin frontend: `http://localhost:5173`
- Express API: `http://localhost:4000/api`
- API health check: `http://localhost:4000/api/health`

The combined development command stops both processes if either one fails.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend and Express API together |
| `npm run dev:web` | Start only the Vite frontend |
| `npm run dev:api` | Start only the Express API |
| `npm run build` | Type-check and build the production frontend |
| `npm run build:api` | Type-check the Express server |
| `npm run lint` | Run Oxlint across the project |
| `npm start` | Start the production Express/React service |
| `npm run db:import` | Import the SQL dump into local MySQL |
| `npm run db:import:render` | Import the SQL dump using Render environment variables |

## Authentication

Customer and administrator authentication use separate local-storage keys so a customer session cannot replace an administrator session. Protected API routes validate JWT bearer tokens, and passwords are verified with bcrypt.

Google Sign-In requires the same OAuth web client ID in both variables:

```dotenv
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Add each frontend address to the Google OAuth client’s **Authorized JavaScript origins**:

- `http://localhost:5173` for local development
- The final HTTPS Render domain for production

OAuth client IDs are public identifiers, but client secrets and JWT secrets must never be added to frontend variables or committed to Git.

## API overview

The API is grouped by responsibility:

- `/api/auth/*` – customer/admin login, signup, and Google authentication
- `/api/products/*` – product catalogue and product details
- `/api/customer/*` – profile, cart, wishlist, checkout, orders, reviews, and chat
- `/api/admin/*` – dashboard resources, order updates, messages, products, and chat
- `/api/newsletter` – newsletter registration and welcome offer issuance
- `/api/contact` – customer enquiries
- `/api/health` – application and database health check

Customer checkout calculations are repeated and validated on the server. The `WELCOME10` newsletter offer requires a matching subscribed customer email and can be redeemed only once by that customer.

## Render deployment

The included `render.yaml` configures one Node web service that builds React and runs Express. Render supplies the production `PORT`, and the server listens on `0.0.0.0` as required.

### Required Render environment variables

```text
CLIENT_ORIGIN
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_ID
```

`JWT_SECRET` is generated automatically by the Blueprint. Do not expose database passwords or JWT secrets as `VITE_*` variables because Vite variables are included in the browser bundle.

### Database deployment

This application uses MySQL, so it requires either:

1. A Render private MySQL service with a persistent disk, or
2. A compatible external hosted MySQL database.

After creating an empty production database, open the application service’s Render Shell and run the guarded importer once:

```bash
ALLOW_DATABASE_IMPORT=YES npm run db:import:render
```

The importer loads `server/database/cosmetics_store.sql` using the configured `DB_*` variables. It is intentionally guarded because importing the dump can replace existing tables and data. Do not run it again after the production store begins receiving real data.

After deployment, verify:

```text
https://your-service.onrender.com/api/health
```

A successful response confirms that both the API and MySQL connection are available.

## Production notes

- Files written to a standard Render service filesystem are temporary. Current storefront assets are committed under `public/` and included in every build.
- If runtime product-image uploads are added later, use object storage or a Render persistent disk instead of the default filesystem.
- The SQL dump is included for demonstration data. Protect real customer information and use dedicated migrations and backups before treating the project as a production commerce service.
- The checkout and payment flows are portfolio demonstrations and do not process real card payments. A production store should integrate a PCI-compliant payment provider such as Stripe.
- Free or low-resource hosting instances may sleep when inactive, so the first API request can take longer.

## Quality checks

Before pushing a change, run:

```bash
npm run build
npm run build:api
npm run lint
```

The repository currently has two non-blocking Fast Refresh warnings in shared UI component files. They do not affect the production build.

## Project background

The original application was created with PHP and MySQL. This version preserves and expands its store, administration, order, messaging, and database concepts while rebuilding the interface and application flow in React, TypeScript, Express, and a component-based architecture.

## Author

Developed by [Thiri Winyati](https://github.com/ThiriWinyati) as a full-stack portfolio project.
