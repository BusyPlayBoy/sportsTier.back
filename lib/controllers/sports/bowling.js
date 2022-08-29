import User from "../../models/user/index.js";
import bowlingUser from "../../models/user/bowling.js";
import { verifyAccess } from "../account/forJwt.js";

/**
 * 볼링 항목에 접근 전, 볼링 유저 데이터를 생성해주는 미들웨어
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function bowlingInitSetting(req, res, next) {
  let accessToken = verifyAccess(req.signedCookies?.accessToken);
  if (!accessToken?.isValid) return res.redirect(307, req.originalUrl);
  let nickname = accessToken.nickname;
  if (!(await bowlingUser.findOne({ nickname }))) {
    let user = await User.findOne({ nickname });
    let email = user.email;
    let newBowlingUser = new bowlingUser();
    newBowlingUser.email = email;
    newBowlingUser.nickname = nickname;
    await newBowlingUser.save();
  }
  next();
}

async function getBowlingUserInfo(req, res) {
  let accessToken = verifyAccess(req.signedCookies?.accessToken);
  if (!accessToken?.isValid) return res.redirect(307, req.originalUrl);
  let nickname = accessToken.nickname;
  let userData = await User.findOne({ nickname });
  let bowlingUserData = await bowlingUser.findOne({ nickname });
  let resJson = {
    email: userData.email,
    nickname: userData.nickname,
    allowNotice: userData.allowNotice,
    eloRating: bowlingUserData.eloRating,
    match: bowlingUserData.match,
    win: bowlingUserData.win,
    draw: bowlingUserData.draw,
  };
  res.status(200).json(resJson);
}

export { bowlingInitSetting, getBowlingUserInfo };
