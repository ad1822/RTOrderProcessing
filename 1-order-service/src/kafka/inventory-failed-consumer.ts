import { Consumer, Kafka } from 'kafkajs';

const kafka: Kafka = new Kafka({
  clientId: 'order-inventory-failed-consumer',
  brokers: ['kafka:9092'],
});

export const consumer: Consumer = kafka.consumer({
  groupId: 'order-inventory-failed-group',
});

export async function startInventoryFailedConsumer(
  topic: string,
): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({
    topic: topic,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString() ?? 'null';

      try {
        const data = JSON.parse(value);
        console.log(data);

        console.log('❌❌❌❌ Order Failed Successfully');
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });
}
