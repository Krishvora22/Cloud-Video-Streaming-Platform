import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { 
    getAllVideos, 
    getVideoById, 
    getRelatedVideos,
    updateVideo,
    searchVideos ,
    deleteVideo,
    getAllCategories,
    getFeaturedVideo
} from '../controllers/video.controllers.js';
import { checkSubscription } from '../middlewares/checkSubscription.js'; // Import it

const videoRouter = express.Router();


videoRouter.get('/', getAllVideos);
videoRouter.get('/search', searchVideos); 
videoRouter.get('/:id', isAuth, checkSubscription, getVideoById);
videoRouter.get('/:id/related', getRelatedVideos);
videoRouter.patch('/:id', isAuth, updateVideo);
videoRouter.delete('/:id', isAuth, deleteVideo);
videoRouter.get('/categories', getAllCategories);
videoRouter.get('/featured', getFeaturedVideo);

export default videoRouter;