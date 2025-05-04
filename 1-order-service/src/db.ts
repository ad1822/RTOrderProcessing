import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export default pool;
