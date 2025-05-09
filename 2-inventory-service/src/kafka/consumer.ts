import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import { Pool } from 'pg';

dotenv.config();

const kafka: Kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'inventory-group' });
const producer = kafka.producer();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const startConsumer = async (): Promise<void> => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'order.created.v1', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value)
          throw new Error('message.value is null or undefined');

        const order = JSON.parse(message.value.toString());

        const { userId, itemId, quantity, orderId } = order;

        const res = await pool.query(
          'SELECT * FROM inventory WHERE itemId = $1',
          [itemId],
        );

        if (res.rows.length > 0) {
          const product = res.rows[0];

          if (product.quantity >= quantity) {
            await pool.query(
              'UPDATE inventory SET quantity = quantity - $1 WHERE itemId = $2',
              [quantity, itemId],
            );

            await producer.send({
              topic: 'inventory.reserved.v1',
              messages: [
                {
                  key: String(itemId),
                  value: JSON.stringify({
                    userId: userId,
                    itemId: itemId,
                    orderId: orderId,
                    status: 'Available',
                    quantity: quantity,
                  }),
                },
              ],
            });
          } else {
            await producer.send({
              topic: 'inventory.failed.v1',
              messages: [
                {
                  key: String(itemId),
                  value: JSON.stringify({
                    userId: userId,
                    itemId: itemId,
                    orderId: orderId,
                    quantity: quantity,
                  }),
                },
              ],
            });
          }
        } else {
          console.log(`Product with itemId ${itemId} not found.`);
        }
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });
};

startConsumer().catch(console.error);
