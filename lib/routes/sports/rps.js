import express from "express";
import {rpsInitSetting, rpsUserInfo} from "../../controllers/sports/rps.js"
const rpsRouter = express.Router();

rpsRouter.use(rpsInitSetting);

rpsRouter.get("/userinfo",rpsUserInfo);

export default rpsRouter;