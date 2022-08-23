import express from "express";
import { checkJwt } from "../../controllers/account/forJwt.js";
import {
  getCommonNoticeList,
  getDirectInquiryList,
  getFAQList,
  postNotice,
  getNotice,
} from "../../controllers/notice/notice.js";
const noticeRouter = express.Router();

noticeRouter.use(checkJwt);

// 공지 사항
noticeRouter.get("/commonNoticeList", getCommonNoticeList);
// 1대1 문의
noticeRouter.get("/directInquiryList", getDirectInquiryList);
// FAQ
noticeRouter.get("/faqList", getFAQList);
// CRUD
noticeRouter.post("/post", postNotice);
noticeRouter.get("/get/:id", getNotice);
noticeRouter.put("/update/:id");
noticeRouter.delete("/delete/:id");
export default noticeRouter;
