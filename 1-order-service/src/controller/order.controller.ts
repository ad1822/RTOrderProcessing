import { Request, Response } from 'express';
import { sendMessage } from '../kafka/producer.js';

interface data {
  userId: string;
  itemId: number;
  orderId: number;
  orderAmount: number;
  status: string | 'Pending';
}

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const data: data = req.body;

  if (
    !data.userId ||
    !data.orderId ||
    !data.itemId ||
    !data.orderAmount ||
    !data.status
  ) {
    res.status(400).send('Missing required fields');
    return;
  }
  const partitionKey = String(data.orderId);

  console.log('Partition Key : ', partitionKey);

  await sendMessage('order.created.v1', [
    { value: JSON.stringify(data), key: partitionKey },
  ]);

  res.send('Message sent!');
};
