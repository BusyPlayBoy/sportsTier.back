import Notice from "../../models/notice/index.js";
import User from "../../models/user/index.js";
import { verifyAccess } from "../account/forJwt.js";
/**
 * response JSON (notice list)
 * @param {*} req http request
 * @param {*} res http response
 */
async function getCommonNoticeList(req, res) {
  const classification = "notice";
  let noticeList = await Notice.find({ classification });
  res.status(200).json({ noticeList });
}

/**
 * response JSON (1vs1 inquiry list)
 * @param {*} req http request
 * @param {*} res http response
 */
async function getDirectInquiryList(req, res) {
  const classification = "1vs1";
  let noticeList = await Notice.find({ classification });
  res.status(200).json({ noticeList });
}

/**
 * response JSON (FAQ list)
 * @param {*} req http request
 * @param {*} res http response
 */
async function getFAQList(req, res) {
  const classification = "FAQ";
  let noticeList = await Notice.find({ classification });
  res.status(200).json({ noticeList });
}

/**
 * create notice at DB
 * @param {*} req http request
 * @param {*} res http response
 * @todo 토큰에서 닉네임과 권한을 확인하는 절차에서 토큰이 만료되었을 시 리다이렉트 요청 보내도록 구현
 */
async function postNotice(req, res) {
  let accessToken = verifyAccess(req.signedCookies?.accessToken);
  let classification = req.body.classification;
  let writer = accessToken.nickname;
  let isSuperUser = accessToken.isSuperUser;
  if (classification !== "1vs1" && !isSuperUser) {
    let errMsg = "permission does not exist!";
    return res.status(400).json({ errMsg });
  }
  let title = req.body.title;
  let content = req.body.content;
  let newNotice = await createNotice(classification, writer, title, content);
  try {
    await newNotice.save();
    console.log(newNotice);
    res.status(200).redirect(`/notice/get/${newNotice.id}`);
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
  }
}

/**
 * read notice
 * @param {*} req http request
 * @param {*} res http response
 */
async function getNotice(req, res) {
  let noticeId = req.params.id;
  let notice = await Notice.findById(noticeId);
  if (!notice) {
    let errMsg = "the object is not found!";
    return res.status(400).json({ errMsg });
  }
  res.status(200).json(notice);
}

/**
 * update notice in DB
 * @param {*} req http request
 * @param {*} res http response
 * @todo writer를 직접 입력 받지 말고 엑세스 토큰을 통해 식별하도록 구현하기
 */
async function putNotice(req, res) {
  let accessToken = verifyAccess(req.signedCookies?.accessToken);
  let noticeId = req.params.id;
  let writer = accessToken.nickname;
  let title = req.body.title;
  let content = req.body.content;
  let notice = await Notice.findById(noticeId);
  if (!notice) {
    let errMsg = "the object is not found!";
    return res.status(400).json({ errMsg });
  }
  if (notice.writer !== writer) {
    let errMsg = "the object`s writer is not matched!";
    return res.status(400).json({ errMsg });
  }
  let newNotice = await Notice.findByIdAndUpdate(noticeId, { title, content });
  if (!newNotice) {
    let errMsg = "update processing error";
    return res.status(400).json({ errMsg });
  }
  res.status(200).redirect(`/notice/get/${newNotice.id}`);
}

/**
 * delete notice in DB
 * @param {*} req http request
 * @param {*} res http response
 * @todo writer를 직접 입력 받지 말고 엑세스 토큰을 통해 식별하도록 구현하기
 */
async function deleteNotice(req, res) {
  let accessToken = verifyAccess(req.signedCookies?.accessToken);
  let noticeId = req.params.id;
  let requester = accessToken.nickname;
  let isSuperUser = accessToken.isSuperUser;
  let notice = await Notice.findById(noticeId);
  if (!isSuperUser && requester !== notice.writer) {
    let errMsg = "permission does not exist!";
    return res.status(400).json({ errMsg });
  }
  await Notice.findByIdAndDelete(noticeId);
  res.status(200).redirect("/notice/commonNoticeList");
}

async function createNotice(classification, writer, title, content) {
  let newNotice = new Notice();
  newNotice.classification = classification;
  newNotice.writer = writer;
  newNotice.title = title;
  newNotice.content = content;
  return newNotice;
}

export {
  postNotice,
  getNotice,
  putNotice,
  deleteNotice,
  getCommonNoticeList,
  getDirectInquiryList,
  getFAQList,
};
