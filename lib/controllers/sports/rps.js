import { verifyAccess } from "../account/forJwt.js";
import User from "../../models/user/index.js";
import rpsUser from "../../models/user/rps.js";

/**
 * DB 내 해당 종목의 user data가 존재하는지 확인 후, 없다면 해당 정보를 생성해주는 미들웨어.
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next
 */
async function rpsInitSetting(req, res, next) {
  let accessToken = req.signedCookies?.accessToken;
  let nickname = verifyAccess(accessToken).nickname;
  // 만약 rpsUser가 존재하지 않는다면 생성
  if (!(await rpsUser.findOne({ nickname }))) {
    // TODO: email - nickname 탐색을 캐시에서 할 수 있도록 설계 하기
    let user = await User.findOne({ nickname });
    let email = user.email;
    let newRpsUser = new rpsUser();
    newRpsUser.email = email;
    newRpsUser.nickname = nickname;
    await newRpsUser.save();
    console.log("rps 정보 생성 완료!");
    console.log(newRpsUser);
  }
  next();
}

/**
 * 해당 종목의 사용자 정보를 JSON 형태로 반환
 * @param {*} req http request
 * @param {*} res http response
 */
async function rpsUserInfo(req, res) {
  let accessToken = verifyAccess(req.signedCookies?.accessToken);
  let nickname = accessToken.nickname;
  let user = await User.findOne({ nickname });
  let userRps = await rpsUser.findOne({ nickname });
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

export { rpsInitSetting, rpsUserInfo };
