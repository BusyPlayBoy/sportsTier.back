import express from "express";
import { checkJwt } from "../../controllers/account/forJwt.js";
import rpsRouter from "./rps.js";
const sportsRouter = express.Router();

sportsRouter.use(checkJwt);

sportsRouter.use("/rps",rpsRouter);

export default sportsRouter;