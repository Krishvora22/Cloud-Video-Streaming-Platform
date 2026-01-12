import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/payment.controllers.js';

const paymentRouter = express.Router();

// 1. User clicks "Pay Now" -> Returns Stripe URL
paymentRouter.post('/create-checkout-session', isAuth, createCheckoutSession);

// 2. Stripe notifies us (No Auth needed, Stripe has its own signature)
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default paymentRouter;