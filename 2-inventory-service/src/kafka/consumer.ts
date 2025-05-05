import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'inventory-group' });

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: parseInt(process.env.DB_PORT || '5432', 10),
// });

export const startConsumer = async (): Promise<void> => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order.created.v1', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `[${topic} | partition: ${partition} | offset: ${message.offset}]`;
      const key = message.key?.toString() ?? 'null';
      const value = message.value?.toString() ?? 'null';
      const timestamp = message.timestamp;

      console.log(`📨 ${prefix}`);
      console.log(`   ┣ key: ${key}`);
      console.log(`   ┣ value: ${value}`);
      console.log(`   ┣ timestamp: ${timestamp}`);
      console.log(`   ┗ headers: ${JSON.stringify(message.headers)}`);
    },
  });
};

startConsumer().catch(console.error);

// await consumer.run({
// eachMessage: async ({ message }) => {
// const order = JSON.parse(message.value.toString());
// const { itemId, orderAmount } = order;
// const res = await pool.query('SELECT * FROM products WHERE id = $1', [
//   itemId,
// ]);
// if (res.rows.length > 0) {
//   const product = res.rows[0];
//   if (product.stock >= orderAmount) {
//     console.log(`Product ${itemId} is available, processing order.`);
//     await pool.query(
//       'UPDATE products SET stock = stock - $1 WHERE id = $2',
//       [orderAmount, itemId],
//     );
//     const producer = kafka.producer();
//     await producer.connect();
//     await producer.send({
//       topic: 'inventory.checked.v1',
//       messages: [
//         {
//           key: String(itemId),
//           value: JSON.stringify({ status: 'available' }),
//         },
//       ],
//     });
//   } else {
//     console.log(`Product ${itemId} is out of stock.`);
//     const producer = kafka.producer();
//     await producer.connect();
//     await producer.send({
//       topic: 'inventory.checked.v1',
//       messages: [
//         {
//           key: String(itemId),
//           value: JSON.stringify({ status: 'out_of_stock' }),
//         },
//       ],
//     });
//   }
// }
// },
// }
// );
