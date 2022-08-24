import Notice from "../../models/notice/index.js";
import User from "../../models/user/index.js";

async function getCommonNoticeList(req, res) {
  const classification = "notice";
  let noticeList = await Notice.find({ classification });
  res.status(200).json({ noticeList });
}

async function getDirectInquiryList(req, res) {
  const classification = "1vs1";
  let noticeList = await Notice.find({ classification });
  res.status(200).json({ noticeList });
}

async function getFAQList(req, res) {
  const classification = "FAQ";
  let noticeList = await Notice.find({ classification });
  res.status(200).json({ noticeList });
}

async function postNotice(req, res) {
  let classification = req.body.classification;
  let writer = req.body.writer;
  let writerData = await User.findOne({ nickname: writer });
  if (classification !== "1vs1" && !writerData.isSuperUser) {
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

async function getNotice(req, res) {
  let noticeId = req.params.id;
  let notice = await Notice.findById(noticeId);
  if (!notice) {
    let errMsg = "the object is not found!";
    return res.status(400).json({ errMsg });
  }
  res.status(200).json(notice);
}

async function putNotice(req, res) {
  let noticeId = req.params.id;
  let writer = req.body.writer;
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

async function deleteNotice(req, res) {
  let noticeId = req.params.id;
  let requester = req.body.nickname;
  let user = await User.findOne({ nickname: requester });
  if (!user) {
    let errMsg = "the nickname is not collected";
    return res.status(400).json({ errMsg });
  }
  let notice = await Notice.findById(noticeId);
  if (!user.isSuperUser && requester !== notice.writer) {
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
