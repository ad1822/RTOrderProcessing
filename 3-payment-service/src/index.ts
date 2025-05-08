import dotenv from 'dotenv';
import express, { Application } from 'express';
import { producer } from './kafka/producer';
import { createTopics } from './kafka/topic';
// import pool from './db.js';
// import { startInventoryConsumer } from './kafka/inventory-consumer.js';
// import { createTopics } from './kafka/topic.js';
// import produceRoute from './routes/order.route.js';

const app: Application = express();
const PORT = process.env.PORT || 3002;

dotenv.config();
app.use(express.json());

const bootstrap = async (): Promise<void> => {
  console.log('🔧 Environment Variables from Payment :');
  console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    KAFKA_BROKER: process.env.KAFKA_BROKER,
    PORT: process.env.PORT || 3002,
  });

  // const client = await pool.connect();
  // console.log('✅ Connected to PostgreSQL');

  // client.release();
  await createTopics(['payment.generated.v1']);
  // await createTopics(['order.payment.updated.v2']);
  await producer.connect();
  // await startConsumer('payment.generated.v1');

  app.listen(PORT, () => {
    console.log(`🚀 Payment Service running on port ${PORT}`);
  });
};

bootstrap();
