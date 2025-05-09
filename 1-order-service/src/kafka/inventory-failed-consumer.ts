import { Consumer, Kafka } from 'kafkajs';
import pool from '../db.js';

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
        console.log('DATA : ', data);

        const query = `UPDATE orders SET status = $1 WHERE orderId = $2`;

        pool.query(query, [data.status, data.orderId]);

        console.log('❌❌❌❌ Order Failed Successfully');
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });
}
