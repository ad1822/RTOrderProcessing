import { Kafka } from 'kafkajs';
import { producer } from './producer.js';

const kafka = new Kafka({
  clientId: 'order-service-inventory-consumer',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'order-inventory-group' });

export async function startInventoryConsumer(topic: string): Promise<void> {
  try {
    console.log(`📦 Starting inventory consumer on topic: ${topic}`);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) {
            console.warn('⚠️ Received empty message');
            return;
          }

          const { userId, itemId, orderId, quantity, status } =
            JSON.parse(value);
          const newStatus = status === 'Available' ? 'fulfilled' : 'rejected';

          await producer.send({
            topic: 'payment.generated.v1',
            messages: [
              {
                key: String(itemId),
                value: JSON.stringify({ userId, itemId, orderId }),
              },
            ],
          });

          console.log(
            `✅ Inventory status received: ${status} → Order ${orderId} marked as '${newStatus}'`,
          );
        } catch (err) {
          console.error('💥 Error processing inventory message:', err);
        }
      },
    });
  } catch (err) {
    console.error('💥 Failed to start inventory consumer:', err);
    process.exit(1);
  }
}
