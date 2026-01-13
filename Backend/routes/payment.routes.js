import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { createCheckoutSession, verifyPayment } from '../controllers/payment.controllers.js';
const router = express.Router();

router.post('/create-checkout-session', isAuth, createCheckoutSession);
router.post('/verify-session', isAuth, verifyPayment);

export default router;