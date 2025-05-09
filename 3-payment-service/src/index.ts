import dotenv from 'dotenv';
import express, { Application } from 'express';
import pool from './db';
import { startConsumer } from './kafka/consumer';
import { startInventoryConsumer } from './kafka/inventory-consumer';
import { producer } from './kafka/producer';
import { createTopics } from './kafka/topic';

const app: Application = express();
const PORT = process.env.PORT || 3002;

dotenv.config();
app.use(express.json());

const bootstrap = async (): Promise<void> => {
  const client = await pool.connect();
  console.log('✅Payment Connected to PostgreSQL');

  client.release();
  await createTopics(['payment.generated.v1']);
  await createTopics(['order.payment.updated.v1']);
  await producer.connect();
  await startInventoryConsumer();
  await startConsumer('payment.generated.v1');

  app.listen(PORT, () => {
    console.log(`🚀🚀🚀 Payment Service running on port ${PORT}`);
  });
};

bootstrap();
