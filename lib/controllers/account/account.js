import User from "../../models/user/index.js";
import util from "util";
import crypto from "node:crypto";
import { issueAccessToken, issueRefreshToken } from "./forJwt.js";
import redisClient from "../../../redis.js";
import "dotenv/config";
import { encodeUTF8 } from "../utils.js";

const randomBytesPromise = util.promisify(crypto.randomBytes);
const passwordEncryption = util.promisify(crypto.pbkdf2);
const passwordHashIteration = parseInt(process.env.PASSWORD_HASH_ITERATION);
const hashAlg = process.env.HASH_ALGORITHM;
const jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE;
const keyOfRefreshTokenInCache = (refreshToken) => `RefreshToken:${refreshToken}:nickname`;

/**
 * User sign up
 * @param {*} req http request
 * @param {*} res http response
 */
async function signup(req, res) {
  let email = req.body.email;
  let nickname = req.body.nickname;
  // 디비에 해당 이용자가 존재하는 확인(email)
  if (await isExistUserEmailInDB(email)) {
    let errMsg = "The input email is already existed";
    res.status(400).json({ errMsg });
  } else if (await isExistUserNicknameInDB(nickname)) {
    let errMsg = "The input nickname is already existed";
    res.status(400).json({ errMsg });
  } else {
    let password = req.body.password;
    let allowNotice = req.body.allowNotice;
    let isSuperUser = req.body.isSuperUser ?? false;
    // 필요시 이메일 검증 추가
    let newUser = await createUser(email, password, nickname, allowNotice, isSuperUser);
    let newUser1 = new User();
    try {
      await newUser.save();
      console.log(newUser);
      res.status(200).json({ msg: "Signup done!" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ err });
    }
  }
}
/**
 * User login
 * @param {*} req http reqeust
 * @param {*} res http response
 */
async function login(req, res) {
  let email = req.body.email;
  const inputUser = await User.findOne({ email });
  // 클라이언트가 입력한 이메일이 DB에 존재하는지 확인, 없다면 에러메세지 발생
  if (!inputUser) {
    const errMsg = "The User is not existed in DB!";
    console.log(errMsg);
    res.status(400).json({ errMsg });
  }
  const inputPassword = await passwordEncryption(
    req.body.password,
    inputUser.salt,
    passwordHashIteration,
    64,
    hashAlg
  );
  // 비밀번호가 DB의 비밀번호와 일치하는지 확인, 없다면 에러메세지 발생
  if (inputPassword.toString("base64") !== inputUser.password) {
    const errMsg = "The password is not collected!";
    console.log(inputPassword);
    console.log(inputUser.password);
    console.log(errMsg);
    res.status(400).json({ errMsg });
  }
  const nickname = inputUser.nickname;
  const accessToken = issueAccessToken(inputUser);
  const refreshToken = issueRefreshToken();
  // 발급한 리프레쉬 토큰을 redis에 저장
  // key = User:refreshToken:email, value = token
  // 이 때 redis 내 리프레쉬 토큰의 기한은 토큰 자체의 기한과 동일한 14일(3600*24*14)JWT_REFRESH_TOKEN_EXPIRE
  await redisClient.setEx(
    keyOfRefreshTokenInCache(refreshToken),
    jwtRefreshTokenExpire,
    encodeUTF8(nickname)
  );
  res.cookie("accessToken", accessToken, { httpOnly: true, signed: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, signed: true });
  res.status(200).json({ accessToken, refreshToken, email, nickname });
}

/**
 * User logout
 * @param {*} req http request
 * @param {*} res http response
 */
async function logout(req, res) {
  if (req.signedCookies.accessToken) res.clearCookie("accessToken");
  if (req.signedCookies.refreshToken) {
    await redisClient.del(`RefreshToken:${req.signedCookies.refreshToken}:nickname`);
    res.clearCookie("refresh");
  }
  res.status(200).json({ msg: "Logout done!" });
}

/**
 * 비밀번호 암호화를 위한 랜덤 salt 생성
 */
async function createSalt() {
  const randomBuffer = await randomBytesPromise(64);
  return randomBuffer.toString("base64");
}

/**
 * DB 내 email을 갖는 User가 존재하는지 여부 반환
 * @param {String} email
 * @return {Promise<boolean>}
 */
async function isExistUserEmailInDB(email) {
  return !!(await User.findOne({ email }));
}

/**
 * DB 내 nickname을 갖는 User가 존재하는지 여부 반환
 * @param {String} nickname
 * @return {Promise<boolean>}
 */
async function isExistUserNicknameInDB(nickname) {
  return !!(await User.findOne({ nickname }));
}

/**
 * 입력 정보를 바탕으로 새로운 User 객체 생성
 * @param {string} email 사용자의 이메일
 * @param {string} password 사용자의 비밀번호
 * @param {string} nickname 사용자의 닉네임
 * @param {boolean} allowNotice 사용자의 알림 허용 여부
 * @param {boolean} isSuperUser 사용자의 권한
 * @return {Promise}
 */
async function createUser(email, password, nickname, allowNotice, isSuperUser) {
  let newSalt = await createSalt();
  let encryptPassword = await passwordEncryption(
    password,
    newSalt,
    passwordHashIteration,
    64,
    hashAlg
  );
  const newUser = new User();
  newUser.email = email;
  newUser.password = encryptPassword.toString("base64");
  newUser.nickname = nickname;
  newUser.salt = newSalt;
  newUser.allowNotice = allowNotice;
  newUser.isSuperUser = isSuperUser;
  return newUser;
}
export { signup, login, logout };
