import "dotenv/config";
import jwt from "jsonwebtoken";
import redisClient from "../../../redis.js";
import User from "../../models/user/index.js";
import { encodeUTF8, decodeUTF8 } from "../utils.js";
const jwtSecret = process.env.JWT_SECRET_KEY;
const jwtAccessTokenExpire = process.env.JWT_ACCESS_TOKEN_EXPIRE;
const jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE;

/**
 * User 객체를 이용하여 엑세스 토큰 발급
 * @param {User} user User 객체
 * @returns {string} access token
 */
function issueAccessToken(user) {
  const payload = { nickname: encodeUTF8(user.nickname), isSuperUser: user.isSuperUser };
  return jwt.sign(payload, jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${jwtAccessTokenExpire}s`,
  });
}

/**
 * 리프레쉬 토큰 발급
 * @returns {string} refresh token
 */
function issueRefreshToken() {
  return jwt.sign({}, jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${jwtRefreshTokenExpire}s`,
  });
}

/**
 * 엑세스 토큰이 유효한지 확인, 유효하다면 isValid: true, 그렇지 않다면 isValid: false
 * @param {string} token 엑세스 토큰
 */
function verifyAccess(token) {
  try {
    let decoded = jwt.verify(token, jwtSecret);
    return {
      isValid: true,
      nickname: decodeUTF8(decoded.nickname),
      isSuperUser: decoded.isSuperUser,
    };
  } catch (err) {
    return { isValid: false, errMsg: err.message };
  }
}

/**
 * redis 캐시 내 리프레쉬 토큰과 비교하여 검증
 * @param {String} token 리프레쉬 토큰
 */
async function verifyRefresh(token) {
  const nicknameFromRefreshTokenInRedis = await redisClient.get(`RefreshToken:${token}:nickname`);
  if (!nicknameFromRefreshTokenInRedis) {
    return { isValid: false };
  }
  try {
    jwt.verify(token, jwtSecret);
    return { isValid: true, nickname: decodeUTF8(nicknameFromRefreshTokenInRedis) };
  } catch (err) {
    return { isValid: false, errMsg: err.message };
  }
}

/**
 * 사용자의 인증 토큰을 확인하는 미들웨어.
 * 엑세스 토큰과 리프레쉬 토큰의 유효 상황에 따라 토큰을 재발급하거나, 로그아웃 시킴
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next
 */
async function checkJwt(req, res, next) {
  let accessToken = req.signedCookies?.accessToken;
  let refreshToken = req.signedCookies?.refreshToken;

  // 쿠키에 엑세스 토큰이 존재하지 않을 경우, 로그인 화면으로 이동
  if (!accessToken) return res.redirect("/account/logout");

  // 액세스 토큰이 유효한 경우, next
  if (verifyAccess(accessToken).isValid) return next();

  // 엑세스 토큰이 유효하지 않은데, 리프레쉬 토큰이 없다면 로그 아웃으로 이동
  if (!refreshToken) return res.redirect("/account/logout");

  const verifyRefreshResult = await verifyRefresh(refreshToken);

  // 액세스 토큰, 리프레쉬 토큰 둘 다 유효하지 않을 땐 로그인으로 이동
  if (!verifyRefreshResult.isValid) return res.redirect("/account/logout");

  // 액세스 토큰만 만료된 상황이라면, 이를 재발급 후 기존 요청 url로 리다이렉트
  let user = await User.findOne({ nickname: verifyRefreshResult.nickname });

  let newAccessToken = issueAccessToken(user);

  res.cookie("accessToken", newAccessToken, { httpOnly: true, signed: true });
  console.log("토큰 재발행!");
  res.redirect(307, req.originalUrl);
}

export { issueAccessToken, issueRefreshToken, verifyAccess, verifyRefresh, checkJwt };
