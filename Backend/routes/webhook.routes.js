import express from 'express';
import { transcodingCompleteWebhook } from '../controllers/webhook.controller.js';

const webhookRouter = express.Router();

// AWS calls this URL
webhookRouter.post('/transcoding-complete', transcodingCompleteWebhook);

export default webhookRouter;