import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.PG_HOST || "119.59.102.23",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "smlao",
    database: process.env.PG_DATABASE || "liff_dashboard",
    port: process.env.PG_PORT || 5432,
  },
});

export default db;