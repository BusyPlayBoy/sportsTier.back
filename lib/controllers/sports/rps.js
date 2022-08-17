import { verifyAccess } from "../forJwt.js";
import User from "../../models/user/index.js";
import rpsUser from "../../models/user/rps.js";
async function rpsInitSetting(req, res, next) {
  let accessToken = req.signedCookies.accessToken;
  let email = verifyAccess(accessToken).email;
  // 만약 rpsUser가 존재하지 않는다면 생성
  if (!(await rpsUser.findOne({ email }))) {
    let newRpsUser = new rpsUser();
    newRpsUser.email = email;
    await newRpsUser.save();
    console.log("rps 정보 생성 완료!");
    console.log(newRpsUser);
  }
  next();
}

async function rpsUserInfo(req, res) {
  let accessToken = verifyAccess(req.signedCookies.accessToken);
  let email = accessToken.email;
  let user = await User.findOne({ email });
  let userRps = await rpsUser.findOne({ email });
  let resJson = {
    email: user.email,
    nickname: user.nickname,
    allowNotice: user.allowNotice,
    eloRating: userRps.eloRating,
    match: userRps.match,
    win: userRps.win,
  };
  res.status(200).json(resJson);
}

export { rpsInitSetting ,rpsUserInfo};
