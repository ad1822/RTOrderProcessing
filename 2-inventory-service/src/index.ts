import dotenv from 'dotenv';
import express from 'express';
import pool from './db.js';
import { startConsumer } from './kafka/order-consumer.js';
import { createTopics } from './kafka/topic.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Welcome to the Inventory Service!');
});

const bootstrap = async () => {
  try {
    //! Connect to PostgreSQL
    const client = await pool.connect();
    console.log('🏭 🏭  Inventory DB connected to PostgreSQL');
    client.release();

    await createTopics(['inventory.reserved.v1', 'inventory.failed.v1']);
    await startConsumer('order.created.v1');

    app.listen(PORT, () => {
      console.log(`🏭🚀🚀  Inventory Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to bootstrap Inventory Service:', error);
    process.exit(1);
  }
};

bootstrap();
