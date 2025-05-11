import dotenv from 'dotenv';
import express, { Application } from 'express';
import pool from './db.js';
import { startInventoryFailedConsumer } from './kafka/inventory-failed-consumer.js';
import { startPaymentConsumer } from './kafka/payment-consumer.js';
import { producer } from './kafka/producer.js';
import { createTopics } from './kafka/topic.js';
import produceRoute from './routes/order.route.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const startServer = async (): Promise<void> => {
  try {
    console.log('🔧 Environment Variables:', process.env); // <-- Print all envs

    //! Connect to PostgreSQL
    const client = await pool.connect();
    console.log('🐔🐔🐔 OrderDB connected to PostgreSQL');
    client.release();

    //! Setup Kafka topics and producers/consumers
    await createTopics(['order.created.v1']);
    await producer.connect();
    await startPaymentConsumer('order.payment.updated.v1');
    await startInventoryFailedConsumer('inventory.failed.v1');

    app.use('/', produceRoute);

    app.listen(PORT, () => {
      console.log(`🐔🚀 Order Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to bootstrap Order Service:', error);
    process.exit(1);
  }
};

startServer();
