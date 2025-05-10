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
  try {
    console.log(`📦 Starting Inventory Failed Consumer on topic: ${topic}`);

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
          const { status, orderId } = JSON.parse(rawValue);

          const query = `UPDATE orders SET status = $1 WHERE orderId = $2`;
          await pool.query(query, [status, orderId]);

          console.log(`❌ Order ${orderId} marked as ${status}`);
        } catch (err) {
          console.error(`❌ Error processing message on ${topic}`, {
            partition,
            offset: message.offset,
            error: err,
          });
        }
      },
    });
  } catch (err) {
    console.error('💥 Failed to initialize inventory failed consumer:', err);
    process.exit(1);
  }
}
