import express from "express";
import {rpsInitSetting, rpsUserInfo} from "../../controllers/sports/rps.js"
import {getRpsMatchResultList} from "../../controllers/match/matchResult.js"
const rpsRouter = express.Router();

rpsRouter.use(rpsInitSetting);

rpsRouter.get("/userinfo",rpsUserInfo);
rpsRouter.get("/userinfo/matchResult",getRpsMatchResultList)

export default rpsRouter;