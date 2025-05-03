import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'app',
  brokers: ['kafka:9092'],
});

export const producer = kafka.producer();

export async function sendMessage(
  topic: string,
  messages: { value: string }[],
) {
  await producer.connect();
  await producer.send({ topic, messages });
  await producer.disconnect();
}
