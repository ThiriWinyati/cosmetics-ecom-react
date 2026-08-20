import mysql from "mysql2/promise";
import { config } from "./config.js";

export const db = mysql.createPool({ ...config.database, waitForConnections: true, connectionLimit: 10, decimalNumbers: true });

export async function transaction<T>(work: (connection: mysql.PoolConnection) => Promise<T>) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
