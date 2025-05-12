import { Admin, Kafka } from 'kafkajs';

const kafka: Kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: [
    process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka.kafka.svc.cluster.local:9092',
  ],
});

export async function createTopics(topics: string[]): Promise<void> {
  const admin: Admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: topics.map((topic) => ({
      topic,
      numPartitions: 3,
    })),
  });

  console.log(`🏭🏭 Topics created: ${topics.join(', ')}`);
  await admin.disconnect();
}
