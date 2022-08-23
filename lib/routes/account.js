import express from "express";
import { signup, login, logout } from "../controllers/account/account.js";
const accountRouter = express.Router();

accountRouter.get("/", (req, res) => {
  res.send("account 첨보냐?");
});

accountRouter.post("/signup", signup);

accountRouter.post("/login", login);

accountRouter.get("/logout", logout);
export default accountRouter;
