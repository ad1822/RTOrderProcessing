import express, { Router } from 'express';
import { createOrder } from '../controller/order.controller.js';

const router: Router = express.Router();

router.post('/produce', createOrder);

// router.get('/produce', listOrders);

export default router;
