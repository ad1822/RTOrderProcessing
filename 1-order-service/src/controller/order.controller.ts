import { Request, Response } from 'express';
import pool from '../db.js';
import { sendMessage } from '../kafka/producer.js';

interface OrderData {
  userId: string;
  itemId: number;
  quantity: number;
  orderId: number;
  status: string | 'Pending';
}

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const data: OrderData = req.body;

  if (
    !data.userId ||
    data.orderId == null ||
    data.itemId == null ||
    data.quantity == null
  ) {
    res.status(400).send('Missing required fields');
    return;
  }

  try {
    const query = `
      INSERT INTO orders (userId, orderId, itemId, quantity, status)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await pool.query(query, [
      data.userId,
      data.orderId,
      data.itemId,
      data.quantity,
      data.status,
    ]);

    console.log('🐔 Order Created : ', data);

    const partitionKey = String(data.orderId);

    await sendMessage('order.created.v1', [
      { value: JSON.stringify(data), key: partitionKey },
    ]);

    console.info(
      '✅ Order Message Sent from API GATEWAY to ===> order.created.v1',
    );

    res.status(201).send('Order created and message sent!');
  } catch (error) {
    console.error('❌ Failed to create order from Order API :', error);
    res.status(500).send('Internal server error');
  }
};

// export const listOrders = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const query = `SELECT * FROM orders`;
//     const result = await pool.query(query);

//     console.log('✅ Order list fetched');
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('❌ Failed to fetch orders:', error);
//     res.status(500).send('Internal server error');
//   }
// };
