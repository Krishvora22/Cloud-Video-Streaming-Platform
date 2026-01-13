import express from 'express';
import isAuth from '../middlewares/isAuth.js'; // This is your 'protect' middleware
import { 
  toggleWatchList, 
  getMyList, 
  checkWatchlistStatus 
} from '../controllers/watchlist.controllers.js';

const watchlistRouter = express.Router();

// 1. POST - Toggle (Add/Remove)
watchlistRouter.post('/', isAuth, toggleWatchList); 

// 2. GET - Fetch the full list
watchlistRouter.get('/', isAuth, getMyList); 

// 3. GET - Check if specific video is in list
// FIXED: Changed 'router' to 'watchlistRouter' and 'protect' to 'isAuth'
watchlistRouter.get("/check/:videoId", isAuth, checkWatchlistStatus);

export default watchlistRouter;