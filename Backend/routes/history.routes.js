import express from 'express';
import isAuth from '../middlewares/isAuth.js'; // User MUST be logged in
import {  getUserHistory , updateProgress } from '../controllers/history.controllers.js';

const historyRouter = express.Router();

historyRouter.get('/', isAuth, getUserHistory);

historyRouter.post('/progress', isAuth, updateProgress);

export default historyRouter;