import { Request, Response } from 'express';
import { sendMessage } from '../kafka/producer.js';

export const createOrder = async (req: Request, res: Response) => {
  // console.log(req.body);
  const data = req.body;
  await sendMessage('test-topic', [{ value: JSON.stringify(data) }]);

  res.send('Message sent!');
};
