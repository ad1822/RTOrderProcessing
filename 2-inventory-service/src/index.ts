import dotenv from 'dotenv';
import express from 'express';
import pool from './db.js';
import { startConsumer } from './kafka/consumer.js';
import { createTopics } from './kafka/topic.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Welcome to the service!');
});

app.listen(PORT, async () => {
  await createTopics(['inventory.reserved.v1']);
  await createTopics(['inventory.failed.v1']);

  await startConsumer('order.created.v1');
  const client = await pool.connect();
  console.log('✅Inventory Connected to PostgreSQL ');

  client.release();

  console.log(`🚀🚀 Inventory Service is running on port ${PORT}`);
});
