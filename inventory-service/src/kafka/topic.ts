import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'app',
  brokers: ['localhost:9092'],
});

export async function createTopics(topics: string[]) {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: topics.map((topic) => ({
      topic,
      numPartitions: 1,
    })),
  });

  console.log(`✅ Topics created: ${topics.join(', ')}`);
  await admin.disconnect();
}
