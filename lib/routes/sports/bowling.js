import express from "express";
import { bowlingInitSetting } from "../../controllers/sports/bowling.js";
const bowlingRouter = express.Router();

bowlingRouter.use(bowlingInitSetting);