import { Consumer, Kafka } from 'kafkajs';
import pool from '../db.js';

const kafka = new Kafka({
  clientId: 'order-service-payment-consumer',
  brokers: ['kafka:9092'],
});

export const consumer: Consumer = kafka.consumer({
  groupId: 'order-payment-updated-group',
});

export async function startPaymentConsumer(topic: string): Promise<void> {
  try {
    console.log(`📦 Starting Order Payment Consumer on topic: ${topic}`);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const rawValue = message.value?.toString();
        if (!rawValue) {
          console.warn(`⚠️ Empty message received on topic ${topic}`);
          return;
        }

        try {
          const { orderId, status } = JSON.parse(rawValue);

          const query = 'UPDATE "orders" SET status = $1 WHERE orderId = $2';
          await pool.query(query, [status, orderId]);

          console.log(`✅ Order ${orderId} updated to status: ${status}`);
        } catch (err) {
          console.error(`❌ Failed to process message on ${topic}`, {
            partition,
            offset: message.offset,
            error: err,
          });
        }
      },
    });
  } catch (err) {
    console.error('💥 Error initializing payment consumer:', err);
    process.exit(1);
  }
}
