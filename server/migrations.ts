import { db } from "./db.js";

type CountRow = { count: number };

export async function ensureDatabaseSchema() {
  const [columnRows] = await db.query(
    `SELECT COUNT(*) count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'customers'
       AND COLUMN_NAME = 'Google_Sub'`,
  );

  if (Number((columnRows as CountRow[])[0]?.count ?? 0) === 0) {
    await db.execute("ALTER TABLE customers ADD COLUMN Google_Sub VARCHAR(255) NULL");
  }

  const [indexRows] = await db.query(
    `SELECT COUNT(*) count
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'customers'
       AND COLUMN_NAME = 'Google_Sub'
       AND NON_UNIQUE = 0`,
  );

  if (Number((indexRows as CountRow[])[0]?.count ?? 0) === 0) {
    await db.execute("CREATE UNIQUE INDEX uq_customers_google_sub ON customers (Google_Sub)");
  }
}
