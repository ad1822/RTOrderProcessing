import dotenv from 'dotenv';
import { Consumer, Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { producer } from './producer';

dotenv.config();

const kafka = new Kafka({
  clientId: 'payment-service-payment-generated-consumer',
  brokers: ['kafka:9092'],
});

export const consumer: Consumer = kafka.consumer({
  groupId: 'payment-consumer',
});

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function startPaymentConsumer(topic: string): Promise<void> {
  try {
    console.log(`🪙 Starting payment consumer on topic: ${topic}`);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (!value) {
            console.warn(`⚠️  Skipping empty message on ${topic}`);
            return;
          }

          const payload = JSON.parse(value);
          payload.status = 'Success';

          const insertQuery = `
            INSERT INTO payment (userId, itemId, orderId, status)
            VALUES ($1, $2, $3, $4)
          `;
          const values = [
            payload.userId,
            payload.itemId,
            payload.orderId,
            payload.status,
          ];

          await pool.query(insertQuery, values);

          await producer.send({
            topic: 'order.payment.updated.v1',
            messages: [
              {
                key: String(payload.itemId),
                value: JSON.stringify({
                  userId: payload.userId,
                  itemId: payload.itemId,
                  orderId: payload.orderId,
                  status: payload.status,
                }),
              },
            ],
          });

          console.log(
            `✅ Payment processed and status updated for Order ${payload.orderId}`,
          );
        } catch (err) {
          console.error('💥 Error processing payment message:', err);
        }
      },
    });
  } catch (err) {
    console.error('💥 Failed to start payment consumer:', err);
    process.exit(1);
  }
}
