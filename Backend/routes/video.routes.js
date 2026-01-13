import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { 
    getAllVideos, 
    getVideoById, 
    getRelatedVideos,
    updateVideo,
    searchVideos,
    deleteVideo,
    getAllCategories,
    getFeaturedVideo,
    incrementView
} from '../controllers/video.controllers.js';
import { checkSubscription } from '../middlewares/checkSubscription.js';

const videoRouter = express.Router();

// 1. Generic/Static routes must come FIRST
videoRouter.get('/', getAllVideos);
videoRouter.get('/search', searchVideos); 
videoRouter.get('/featured', getFeaturedVideo);
videoRouter.get('/categories', getAllCategories); // ✅ MOVED UP: Must be before /:id

// 2. Dynamic routes (/:id) must come LAST
videoRouter.get('/:id', isAuth, checkSubscription, getVideoById);
videoRouter.get('/:id/related', getRelatedVideos);
videoRouter.patch('/:id', isAuth, updateVideo);
videoRouter.delete('/:id', isAuth, deleteVideo);
videoRouter.post('/:id/view', isAuth, incrementView);
export default videoRouter;