import dotenv from 'dotenv';
import express, { Application } from 'express';
import pool from './db.js';
import { startConsumer } from './kafka/consumer.js';
import { startInventoryConsumer } from './kafka/inventory-consumer.js';
import { producer } from './kafka/producer.js';
import { createTopics } from './kafka/topic.js';
import produceRoute from './routes/order.route.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());

const bootstrap = async (): Promise<void> => {
  console.log('🔧 Environment Variables from Order:');
  console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    KAFKA_BROKER: process.env.KAFKA_BROKER,
    PORT: process.env.PORT || 3000,
  });

  const client = await pool.connect();
  console.log('✅ Connected to PostgreSQL');

  client.release();
  await createTopics(['order.created.v1']);
  await producer.connect();
  // await startConsumer('order.created.v1');
  await startInventoryConsumer();
  await startConsumer('payment.generated.v1');

  app.use('/', produceRoute);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

bootstrap();
