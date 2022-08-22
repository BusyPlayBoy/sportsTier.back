import "dotenv/config";
import jwt from "jsonwebtoken";
import redisClient from "../../redis.js";
import User from "../models/user/index.js";

const jwtSecret = process.env.JWT_SECRET_KEY;
const jwtAccessTokenExpire = process.env.JWT_ACCESS_TOKEN_EXPIRE;
const jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE;

function issueAccessToken(user) {
  const payload = { email: user.email, isSuperUser: user.isSuperUser };
  return jwt.sign(payload, jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${jwtAccessTokenExpire}s`,
  });
}

function issueRefreshToken() {
  return jwt.sign({}, jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${jwtRefreshTokenExpire}s`,
  });
}

function verifyAccess(token) {
  try {
    let decoded = jwt.verify(token, jwtSecret);
    return { isValid: true, email: decoded.email, isSuperUser: decoded.isSuperUser };
  } catch (err) {
    return { isValid: false, message: err.message };
  }
}

async function verifyRefresh(token) {
  // redis 데이터 내의 리프레쉬 토큰과 비교
  const emailFromRefreshTokenInRedis = await redisClient.get(`RefreshToken:${token}:email`);
  if (!emailFromRefreshTokenInRedis) {
    return { isValid: false };
  }
  try {
    jwt.verify(token, jwtSecret);
    return { isValid: true, email: emailFromRefreshTokenInRedis };
  } catch (err) {
    return { isValid: false };
  }
}

async function checkJwt(req, res, next) {
  // 쿠키에 엑세스 토큰이 존재하지 않을 경우, 로그인 화면으로 이동
  if (!req.signedCookies.accessToken) return res.redirect("/account/logout");

  let accessToken = req.signedCookies.accessToken;

  // 액세스 토큰이 유효한 경우, next
  if (verifyAccess(accessToken).isValid) return next();

  // 엑세스 토큰이 유효하지 않은데, 리프레쉬 토큰이 없다면 로그 아웃으로 이동
  if (!req.signedCookies.refreshToken) return res.redirect("/account/logout");

  const verifyRefreshResult = await verifyRefresh(req.signedCookies.refreshToken);

  // 액세스 토큰, 리프레쉬 토큰 둘 다 유효하지 않을 땐 로그인으로 이동
  if (!verifyRefreshResult.isValid) return res.redirect("/account/logout");

  // 액세스 토큰만 만료된 상황이라면, 이를 재발급 후 기존 요청 url로 리다이렉트
  let user = await User.findOne({ email: verifyRefreshResult.email });

  let newAccessToken = issueAccessToken(user);

  res.cookie("accessToken", newAccessToken, { httpOnly: true, signed: true });
  console.log("토큰 재발행!");
  return res.redirect(req.originalUrl);
}

export { issueAccessToken, issueRefreshToken, verifyAccess, verifyRefresh, checkJwt };
