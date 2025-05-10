import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import { Pool } from 'pg';

dotenv.config();

// Kafka setup
const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'inventory-group' });
const producer = kafka.producer();

// PostgreSQL setup
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const startConsumer = async (topic: string): Promise<void> => {
  try {
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    console.log(`📥 Subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          if (!message.value) {
            throw new Error('Received message with no value.');
          }

          const order = JSON.parse(message.value.toString());
          const { userId, itemId, quantity, orderId } = order;

          const result = await pool.query(
            'SELECT * FROM inventory WHERE itemId = $1',
            [itemId],
          );

          if (result.rows.length === 0) {
            console.warn(`❗️ Item with ID ${itemId} not found in inventory.`);
            return;
          }

          const product = result.rows[0];

          if (product.quantity >= quantity) {
            await pool.query(
              'UPDATE inventory SET quantity = quantity - $1 WHERE itemId = $2',
              [quantity, itemId],
            );

            console.log(`✅ Inventory updated for itemId ${itemId}.`);
            console.log(
              `📤 Sending 'inventory.reserved.v1' for orderId ${orderId}`,
            );

            await producer.send({
              topic: 'inventory.reserved.v1',
              messages: [
                {
                  key: String(itemId),
                  value: JSON.stringify({
                    userId,
                    itemId,
                    orderId,
                    status: 'Available',
                    quantity,
                  }),
                },
              ],
            });
          } else {
            console.warn(`❌ Insufficient inventory for itemId ${itemId}.`);
            console.log(
              `📤 Sending 'inventory.failed.v1' for orderId ${orderId}`,
            );

            await producer.send({
              topic: 'inventory.failed.v1',
              messages: [
                {
                  key: String(itemId),
                  value: JSON.stringify({
                    userId,
                    itemId,
                    orderId,
                    status: 'Rejected',
                    quantity,
                  }),
                },
              ],
            });
          }
        } catch (err) {
          console.error('💥 Error processing message:', err);
        }
      },
    });
  } catch (err) {
    console.error('💥 Failed to start consumer:', err);
    process.exit(1);
  }
};
