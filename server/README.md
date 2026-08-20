# Charm & Grace API

This Express/TypeScript API replaces the PHP server-side code while retaining the original MySQL schema and data.

## Local setup

### Docker database (easiest)

1. Start Docker Desktop.
2. Run `docker compose up -d database` from the project directory. The supplied SQL is imported automatically on first start.
3. Run `npm run dev`. This now starts both React and Express.

### Existing MySQL installation

1. Copy `.env.example` to `.env` and enter your MySQL credentials.
2. Create the database: `mysql -u root -p -e "CREATE DATABASE cosmetics_store CHARACTER SET utf8mb4"`.
3. Import the supplied data: `npm run db:import`.
4. Start the API: `npm run dev:api`.
5. In another terminal, start React: `npm run dev`.

The API runs at `http://localhost:4000/api` by default. Verify database access at `GET /api/health`.

## API groups

- `/api/auth`: customer registration/login, administrator login and sessions
- `/api/products`: catalogue, product detail, shades, images, reviews and admin product CRUD
- `/api/customer`: profile, cart, wishlist, checkout, order history, reviews and chat
- `/api/admin`: dashboard reporting, entities, orders, deliveries, reviews, contact messages and chat
- `/api/categories`, `/api/brands`, `/api/coupons`, `/api/shipping-methods`, `/api/payment-methods`, `/api/contact`: public storefront data

Protected endpoints require `Authorization: Bearer <token>`. Never use the default JWT secret in production.
