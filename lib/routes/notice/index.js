import express from "express";
import { checkJwt } from "../../controllers/account/forJwt.js";
const noticeRouter = express.Router();

noticeRouter.use(checkJwt);

// 공지 사항
noticeRouter.get("/",(req,res)=>{
    
});
// 1대1 문의
noticeRouter.get("/directInquiry");
// FAQ
noticeRouter.get("/faq");
export default noticeRouter;
