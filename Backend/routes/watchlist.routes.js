import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { toggleWatchList, getMyList } from '../controllers/watchlist.controllers.js';

const watchlistRouter = express.Router();

watchlistRouter.post('/', isAuth, toggleWatchList); // Add or Remove
watchlistRouter.get('/', isAuth, getMyList);        // View List

export default watchlistRouter;