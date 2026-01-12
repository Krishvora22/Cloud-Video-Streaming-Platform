import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { connectDb } from './config/db.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import videoRouter from './routes/video.routes.js';
import historyRouter from './routes/history.routes.js';
import watchlistRouter from './routes/watchlist.routes.js';
import paymentRouter from './routes/payment.routes.js';
import { handleStripeWebhook } from './controllers/payment.controllers.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
// const prisma = new PrismaClient();

app.use(cors({
    origin: true, 
    credentials: true,
}));

// 1. STRIPE WEBHOOK (Must be FIRST)
// This route is defined manually here to skip the global JSON parser.
// It uses express.raw() and calls the controller directly.
app.post(
    '/api/payment/webhook', 
    express.raw({ type: 'application/json' }), 
    handleStripeWebhook
);

// 2. GLOBAL JSON PARSER (For everything else)
app.use(express.json({
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('Invalid JSON received:', buf.toString());
            throw e;
        }
    }
}));

app.use(cookieParser());

// 3. ROUTES
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhookRouter); // AWS Webhook
app.use('/api/videos', videoRouter);
app.use('/api/history', historyRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/payment', paymentRouter); // Handles checkout (not webhook)

app.listen(port, () => {
    connectDb();
    console.log(`Server started on port ${port}`);
});

export default app;