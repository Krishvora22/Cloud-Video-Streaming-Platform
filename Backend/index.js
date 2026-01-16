import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDb } from './config/db.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import videoRouter from './routes/video.routes.js';
import historyRouter from './routes/history.routes.js';
import watchlistRouter from './routes/watchlist.routes.js';
import paymentRouter from './routes/payment.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// app.use(cors({
//   origin: 'http://localhost:3000',
// }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());

// ROUTES
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/videos', videoRouter); // Changed to plural to match common naming
app.use('/api/history', historyRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/payment', paymentRouter); 

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        connectDb();
        console.log(`Server started on port ${port}`);
    });
}

export default app;