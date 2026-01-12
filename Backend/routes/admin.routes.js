import express from 'express';
import isAuth from '../middlewares/isAuth.js';       // 1. Check if logged in
import adminAuth from '../middlewares/adminAuth.js'; // 2. Check if Admin
import { 
    generateUploadUrl, 
    createVideoMetadata, 
    getDashboardStats 
} from '../controllers/admin.controllers.js';

const adminRouter = express.Router();


// 1. Generate S3 Presigned URL (The "Start Upload" button)
// Logic: Creates DB Entry -> Returns S3 URL & VideoID
adminRouter.post('/upload-url', isAuth, adminAuth, generateUploadUrl);

// 2. Save Video Details (Title, Desc, Thumbnail)
// Logic: Updates the "PENDING" video with real details
adminRouter.post('/videos', isAuth, adminAuth, createVideoMetadata);

// 3. Admin Dashboard (Optional)
// Logic: Returns total views, total users, storage used
adminRouter.get('/stats', isAuth, adminAuth, getDashboardStats);

export default adminRouter;