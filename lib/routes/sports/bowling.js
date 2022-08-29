import express from "express";
import { bowlingInitSetting, getBowlingUserInfo } from "../../controllers/sports/bowling.js";
const bowlingRouter = express.Router();

bowlingRouter.use(bowlingInitSetting);

bowlingRouter.get("/userInfo", getBowlingUserInfo);