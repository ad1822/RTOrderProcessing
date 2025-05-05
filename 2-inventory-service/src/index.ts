import express from 'express';
import { startConsumer } from './kafka/consumer.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Welcome to the service!');
});

app.listen(PORT, async () => {
  await startConsumer();
  console.log(`🚀🚀🚀 Inventory Service is running on port ${PORT}`);
});
