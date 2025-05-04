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
  CREATE TABLE IF NOT EXISTS ORDER_DB (
      id SERIAL PRIMARY KEY,
      userId text(5),
      orderId integer(3),
      itemId integer(3),
      orderAmount integer(5),
      status text(100),
  );
`;

pool
  .query(createTableQuery)
  .then((result) => {
    console.log('Table created successfully:', result);
  })
  .catch((err) => {
    console.error('Error creating table:', err);
  })
  .finally(() => {
    pool.end();
  });

export default pool;
