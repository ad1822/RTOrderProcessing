import express from 'express';
import { startConsumer } from './kafka/consumer.js';
import { createTopics } from './kafka/topic.js';
import produceRoute from './routes/order.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Kafka microservice running!');
});

const bootstrap = async () => {
  await createTopics(['test-topic']);
  await startConsumer('test-topic');

  app.use('/', produceRoute);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

bootstrap().catch(console.error);
