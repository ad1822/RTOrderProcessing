import { Consumer, Kafka } from 'kafkajs';
import pool from '../db.js';

const kafka: Kafka = new Kafka({
  clientId: 'order-service-order-created-consumer',
  brokers: ['kafka:9092'],
});

export const consumer: Consumer = kafka.consumer({
  groupId: 'order-payment-updated-group',
});

export async function startConsumer(topic: string): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `[${topic} | partition: ${partition} | offset: ${message.offset}]`;
      const key = message.key?.toString() ?? 'null';
      const value = message.value?.toString() ?? 'null';
      const timestamp = message.timestamp;

      console.log(`ORDER PAYMENT UPDATED 📨 ${prefix}`);
      console.log(`   ┣ key: ${key}`);
      console.log(`   ┣ value: ${value}`);
      console.log(`   ┣ timestamp: ${timestamp}`);
      console.log(`   ┗ headers: ${JSON.stringify(message.headers)}`);

      try {
        const data = JSON.parse(value);

        const query = 'UPDATE "orders" SET status = $1 WHERE orderId = $2';

        await pool.query(query, [data.status, data.orderId]);
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });
}
