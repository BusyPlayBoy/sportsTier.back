import User from "../models/user/index.js";
import util from "util";
import crypto from "node:crypto";
import { issueAccessToken, issueRefreshToken } from "./forJwt.js";
import redisClient from "../../redis.js";
import "dotenv/config";

const randomBytesPromise = util.promisify(crypto.randomBytes);
const passwordEncryption = util.promisify(crypto.pbkdf2);
const passwordHashIteration = parseInt(process.env.PASSWORD_HASH_ITERATION);
const hashAlg = process.env.HASH_ALGORITHM;
const keyOfRefreshTokenInCache = (refreshToken) => `RefreshToken:${refreshToken}:email`;
const jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE;

async function signup(req, res) {
  let email = req.body.email;
  // 디비에 해당 이용자가 존재하는 확인(email)
  if (await isExistUserEmailInDB(email)) {
    res.status = 400;
    res.send("The input data is already existed");
  } else {
    let password = req.body.password;
    let nickname = req.body.nickname;
    let allowNotice = req.body.allowNotice;
    // 필요시 이메일 검증 추가
    let newUser = await createUser(email, password, nickname, allowNotice);
    try {
      await newUser.save();
      console.log(newUser);
      res.redirect("/login");
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
}

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
    res.status(400).send({ errMsg });
  }
  const accessToken = issueAccessToken(inputUser);
  const refreshToken = issueRefreshToken();
  // 발급한 리프레쉬 토큰을 redis에 저장
  // key = User:refreshToken:email, value = token
  // 이 때 redis 내 리프레쉬 토큰의 기한은 토큰 자체의 기한과 동일한 14일(3600*24*14)JWT_REFRESH_TOKEN_EXPIRE
  await redisClient.setEx(keyOfRefreshTokenInCache(refreshToken), jwtRefreshTokenExpire, email);
  res.cookie("accessToken", accessToken, { httpOnly: true, signed: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, signed: true });
  res.status(200).json({ accessToken, refreshToken });
}

function logout(req, res) {
  if (req.signedCookies.accessToken) res.clearCookie("accessToken");
  if (req.signedCookies.refreshToken) res.clearCookie("refresh");
  res.status(200).redirect("/account/login");
}

async function createSalt() {
  const randomBuffer = await randomBytesPromise(64);
  return randomBuffer.toString("base64");
}

async function isExistUserEmailInDB(email) {
  return !!(await User.findOne({ email }));
}

async function createUser(email, password, nickname, allowNotice) {
  const newSalt = await createSalt();
  const encryptPassword = await passwordEncryption(
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
  return newUser;
}

export { signup, login, logout };
