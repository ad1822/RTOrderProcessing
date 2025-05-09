import { Consumer, Kafka } from 'kafkajs';
import pool from '../db.js';

const kafka: Kafka = new Kafka({
  clientId: 'order-service-payment-consumer',
  brokers: ['kafka:9092'],
});

export const consumer: Consumer = kafka.consumer({
  groupId: 'order-payment-updated-group',
});

export async function startPaymentConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'order.payment.updated.v1',
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString() ?? 'null';

      try {
        const data = JSON.parse(value);

        const query = 'UPDATE "orders" SET status = $1 WHERE orderId = $2';

        await pool.query(query, [data.status, data.orderId]);
        console.log('✅✅✅✅✅ Operation Complete !!!');
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });
}
