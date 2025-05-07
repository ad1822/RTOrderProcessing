import dotenv from 'dotenv';
import { Consumer, Kafka } from 'kafkajs';
import { Pool } from 'pg';
dotenv.config();

const kafka: Kafka = new Kafka({
  clientId: 'payment-service-payment-generated-consumer',
  brokers: ['kafka:9092'],
});

export const consumer: Consumer = kafka.consumer({ groupId: 'test-group' });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function startConsumer(topic: string): Promise<void> {
  console.log('PAYMENT ENV : ', pool);
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `[${topic} | partition: ${partition} | offset: ${message.offset}]`;
      const key = message.key?.toString() ?? 'null';
      const value = message.value?.toString() ?? 'null';
      const timestamp = message.timestamp;

      console.log(`Payment 📨 ${prefix}`);
      console.log(`   ┣ key: ${key}`);
      console.log(`   ┣ value: ${value}`);
      console.log(`   ┣ timestamp: ${timestamp}`);
      console.log(`   ┗ headers: ${JSON.stringify(message.headers)}`);

      try {
        console.log('PAYMENT MESSAGE : ', value);
        const payload = JSON.parse(value);

        console.log('PAYLOAD IN PAYMENT : ', payload);

        const query =
          'INSERT INTO payment (userId, itemId, orderId, quantity, status) VALUES ($1, $2, $3, $4, $5)';
        const values = [
          payload.userId,
          payload.itemId,
          payload.orderId,
          payload.quantity,
          payload.status,
        ];

        const res = await pool.query(query, values);
        console.log('RES : ', res.rowCount);
      } catch (err) {
        console.log('ERROR : ', err);
      }
    },
  });
}
