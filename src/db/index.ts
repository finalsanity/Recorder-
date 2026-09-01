import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type SslOptions } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

export const db = databaseUrl
  ? drizzle(
      mysql.createPool({
        uri: databaseUrl,
        ssl: false as unknown as SslOptions,
        connectionLimit: 5,
      }),
    )
  : null;
