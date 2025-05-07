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

  await consumer.subscribe({ topic: 'order.created.v1', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `[${topic} | partition: ${partition} | offset: ${message.offset}]`;
      console.log(`📨 ${prefix}`);
      console.log(`   ┣ key: ${message.key?.toString() ?? 'null'}`);
      console.log(`   ┣ value: ${message.value?.toString() ?? 'null'}`);
      console.log(`   ┣ timestamp: ${message.timestamp}`);
      console.log(`   ┗ headers: ${JSON.stringify(message.headers)}`);

      try {
        if (!message.value)
          throw new Error('message.value is null or undefined');

        const order = JSON.parse(message.value.toString());

        const { userId, itemId, quantity, orderId } = order;
        console.log('Parsed Order in INVENTORY :', order);

        const res = await pool.query(
          'SELECT * FROM inventory WHERE itemId = $1',
          [itemId],
        );

        console.log('RES INVENTORY : ', res);

        if (res.rows.length > 0) {
          const product = res.rows[0];
          // console.log('PRODUCT : ', product);

          if (product.quantity >= quantity) {
            console.log(`Product ${itemId} is available, processing order.`);

            await pool.query(
              'UPDATE inventory SET quantity = quantity - $1 WHERE itemId = $2',
              [quantity, itemId],
            );

            await producer.send({
              topic: 'inventory.checked.v1',
              messages: [
                {
                  key: String(itemId),
                  value: JSON.stringify({
                    userId: userId,
                    itemId: itemId,
                    orderId: orderId,
                    status: 'available',
                    quantity: quantity,
                    remaining: product.quantity - quantity,
                  }),
                },
              ],
            });
          } else {
            console.log(`Product ${itemId} is out of stock.`);

            await producer.send({
              topic: 'inventory.checked.v1',
              messages: [
                {
                  key: String(itemId),
                  value: JSON.stringify({
                    userId: userId,
                    itemId: itemId,
                    orderId: orderId,
                    status: 'out_of_stock',
                    quantity: quantity,
                    remaining: product.quantity,
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
