import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";

const publicMiddleware = express.Router();
publicMiddleware.use(publicMiddlewareSet());

export default publicMiddleware;


/** 모든 url에 기본적으로 적용되는 미들웨어 */
function publicMiddlewareSet() {
  return [
    express.json(),
    express.urlencoded({ extended: true }),
    cookieParser(process.env.COOKIE_SECRET),
  ];
}
