import express from 'express';
// import { startConsumer } from './kafka/consumer.js';
// import { sendMessage } from './kafka/producer.js';
// import { createTopics } from './kafka/topic.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Kafka microservice running!');
});

// app.post('/produce', async (_req, res) => {
//   // await sendMessage('test-topic', [
//     { value: 'Message from /produce endpoint' },
//   ]);
//   res.send('Message sent!');
// });

const bootstrap = async () => {
  // await createTopics(['test-topic']);
  // await startConsumer('test-topic');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

bootstrap().catch(console.error);
