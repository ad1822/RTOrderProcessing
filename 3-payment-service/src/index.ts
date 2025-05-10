import dotenv from 'dotenv';
import express, { Application } from 'express';
import pool from './db';
import { startInventoryConsumer } from './kafka/inventory-consumer';
import { startPaymentConsumer } from './kafka/payment-consumer';
import { producer } from './kafka/producer';
import { createTopics } from './kafka/topic';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

const bootstrap = async (): Promise<void> => {
  try {
    //! Connect to PostgreSQL
    const client = await pool.connect();
    console.log('🧾🧾 ✅ Payment DB connected to PostgreSQL');
    client.release();

    await createTopics(['payment.generated.v1', 'order.payment.updated.v1']);

    await producer.connect();

    await startInventoryConsumer('inventory.reserved.v1');
    await startPaymentConsumer('payment.generated.v1');

    app.listen(PORT, () => {
      console.log(`🧾🧾 🚀🚀🚀 Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('💥 Failed to bootstrap Payment Service:', error);
    process.exit(1);
  }
};

bootstrap();
