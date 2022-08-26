import express from "express";
import { checkJwt } from "../../controllers/account/forJwt.js";
import { getMyPage } from "../../controllers/mypage/mypage.js";

const myPageRouter = express.Router();

myPageRouter.use(checkJwt);

myPageRouter.get("/", getMyPage);


export default myPageRouter;