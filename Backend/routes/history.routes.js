import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { updateProgress, getVideoHistory , getUserHistory } from '../controllers/history.controllers.js';

const historyRouter = express.Router();

historyRouter.post("/progress", isAuth, updateProgress);
historyRouter.get("/:videoId", isAuth, getVideoHistory); // The resume route
historyRouter.get("/", isAuth, getUserHistory);

export default historyRouter;