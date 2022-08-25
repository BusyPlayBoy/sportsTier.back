import User from "../../models/user/index.js";
import { sportsToModel } from "../../controllers/sports/utils.js";
import { verifyAccess } from "../account/forJwt.js";
/**
 *
 * @param {*} req http request
 * @param {*} res http response
 * @todo Redis cache 활용하기
 */
async function getMyPage(req, res) {
  const accessToken = verifyAccess(req.signedCookies?.accessToken);
  const nickname = accessToken.nickname;
  let user = await User.findOne({ nickname });
  let email = user.email;
  let comment = user.comment;
  let myPage = { user: { email, nickname, comment } };
  for (let sport of Object.keys(sportsToModel)) {
    let sportUser = await sportsToModel[sport].findOne({ nickname });
    let match = sportUser?.match;
    let win = sportUser?.win;
    let draw = sportUser?.draw;
    let eloRating = sportUser?.eloRating;
    myPage[sport] = { match, win, draw, eloRating };
  }
  res.status(200).json(myPage);
}

export { getMyPage };
