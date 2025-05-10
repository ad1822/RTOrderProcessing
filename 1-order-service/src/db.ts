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

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(10),
    orderId VARCHAR(10),
    itemId INTEGER,
    quantity INTEGER,
    status TEXT
  );
`;

pool
  .query(createTableQuery)
  .then(() => {
    console.log('✅ Table "orders" created successfully.');
  })
  .catch((err) => {
    console.error('❌ Error creating table:', err.message);
  });

export default pool;
