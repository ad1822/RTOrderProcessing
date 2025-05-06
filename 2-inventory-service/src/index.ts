import dotenv from 'dotenv';
import express from 'express';
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
  console.log('🔧 Environment Variables:');
  console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    PORT: process.env.PORT || 3001,
  });
  await createTopics(['inventory.checked.v1']);
  // await producer.connect();
  await startConsumer();
  console.log(`🚀🚀🚀 Inventory Service is running on port ${PORT}`);
});
