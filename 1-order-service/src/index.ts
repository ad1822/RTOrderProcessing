import dotenv from 'dotenv';
import express, { Application } from 'express';
import pool from './db.js';
import { startPaymentConsumer } from './kafka/payment-consumer.js';
import { producer } from './kafka/producer.js';
import { createTopics } from './kafka/topic.js';
import produceRoute from './routes/order.route.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());

const bootstrap = async (): Promise<void> => {
  const client = await pool.connect();
  console.log('✅ORDERS Connected to PostgreSQL ');

  client.release();
  await createTopics(['order.created.v1']);
  await producer.connect();

  // await startInventoryConsumer();
  await startPaymentConsumer();

  app.use('/', produceRoute);

  app.listen(PORT, () => {
    console.log(`🚀 Order Service running on port ${PORT}`);
  });
};

bootstrap();
