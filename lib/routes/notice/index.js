import express from "express";
import { checkJwt } from "../../controllers/account/forJwt.js";
import {
  getCommonNoticeList,
  getDirectInquiryList,
  getFAQList,
  postNotice,
  getNotice,
  putNotice,
  deleteNotice,
} from "../../controllers/notice/notice.js";
const noticeRouter = express.Router();

/** 로그인 상태인지 토큰을 통해 확인 */
noticeRouter.use(checkJwt);

/** 일반 공지 */
noticeRouter.get("/commonNoticeList", getCommonNoticeList);

/** 1vs1 문의 */
noticeRouter.get("/directInquiryList", getDirectInquiryList);

/** FAQ */
noticeRouter.get("/faqList", getFAQList);

/** CRUD */
noticeRouter.post("/post", postNotice);
noticeRouter.get("/get/:id", getNotice);
noticeRouter.put("/put/:id", putNotice);
noticeRouter.delete("/delete/:id", deleteNotice);

export default noticeRouter;
