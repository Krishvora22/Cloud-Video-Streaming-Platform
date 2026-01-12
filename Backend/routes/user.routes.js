import express from 'express';
import { getCurrentUser , updateProfile } from '../controllers/user.controllers.js';
import isAuth from '../middlewares/isAuth.js';

const userRouter = express.Router();

userRouter.get('/current' ,isAuth, getCurrentUser);
userRouter.patch('/profile', isAuth, updateProfile);

export default userRouter;
