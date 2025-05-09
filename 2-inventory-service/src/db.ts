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
  CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  itemId INTEGER,
  quantity INT NOT NULL
);
`;

pool
  .query(createTableQuery)
  .then(() => {
    console.log('✅ Table "inventory" created successfully.');
  })
  .catch((err) => {
    console.error('❌ Error creating table:', err.message);
  });

export default pool;
