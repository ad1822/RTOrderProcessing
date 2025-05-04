import dotenv from 'dotenv';
import express, { Application } from 'express';
import { startConsumer } from './kafka/consumer.js';
import { producer } from './kafka/producer.js';
import { createTopics } from './kafka/topic.js';
import produceRoute from './routes/order.route.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());

const bootstrap = async (): Promise<void> => {
  await createTopics(['order.created.v1']);
  await producer.connect();
  await startConsumer('order.created.v1');

  app.use('/', produceRoute);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

bootstrap();
