import { Kafka } from 'kafkajs';
import db from '../db.js';

const kafka = new Kafka({
  clientId: 'order-service-inventory-consumer',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'order-inventory-group' });

export async function startInventoryConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'inventory.checked.v1',
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();
      console.log('VALUE : ', value);

      if (!value) return;

      const { orderId, quantity, status } = JSON.parse(value);
      console.log('status : ', status);

      const newStatus = status === 'available' ? 'fulfilled' : 'rejected';
      await db.query('UPDATE orders SET status = $1 WHERE orderId = $2', [
        newStatus,
        orderId,
      ]);

      console.log(`✅ Order ${orderId} updated to status: ${newStatus}`);
    },
  });
}
