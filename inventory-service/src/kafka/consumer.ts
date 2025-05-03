import { EachMessagePayload, Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'app',
  brokers: ['kafka:9092'],
});

export const consumer = kafka.consumer({ groupId: 'test-group' });

export async function startConsumer(topic: string) {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      console.log(`📨 [${topic}] ${message.value?.toString()}`);
    },
  });
}
