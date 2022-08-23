import Notice from "../../models/notice/index.js";

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
  let title = req.body.title;
  let content = req.body.content;
  let newNotice = await createNotice(classification, writer, title, content);
  try {
    await newNotice.save();
    console.log(newNotice);
    res.status(200).redirect(`/notice/get/${newNotice._id.toString()}`);
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
    res.status(400).json({ errMsg });
  } else {
    res.status(200).json(notice);
  }
}
async function createNotice(classification, writer, title, content) {
  let newNotice = new Notice();
  newNotice.classification = classification;
  newNotice.writer = writer;
  newNotice.title = title;
  newNotice.content = content;
  return newNotice;
}

export { postNotice, getNotice, getCommonNoticeList, getDirectInquiryList, getFAQList };
