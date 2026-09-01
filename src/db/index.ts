import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

export const db = databaseUrl
  ? drizzle(
      mysql.createPool({ uri: databaseUrl, ssl: false, connectionLimit: 5 }),
    )
  : null;
