import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { config } from "../config.js";

if (process.env.ALLOW_DATABASE_IMPORT !== "YES") {
  throw new Error("Database import cancelled. Run with ALLOW_DATABASE_IMPORT=YES only for the initial Render import.");
}

const sqlPath = path.resolve(process.cwd(), "server/database/cosmetics_store.sql");
const sql = await readFile(sqlPath, "utf8");
const connection = await mysql.createConnection({
  ...config.database,
  multipleStatements: true,
  decimalNumbers: true,
});

try {
  console.log(`Importing cosmetics_store.sql into ${config.database.database}...`);
  await connection.query(sql);
  console.log("Database import completed successfully.");
} finally {
  await connection.end();
}
