import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";

const publicMiddleware = express.Router();
publicMiddleware.use(publicMiddlewareSet());

export default publicMiddleware;

function publicMiddlewareSet() {
  return [
    express.json(),
    express.urlencoded({ extended: true }),
    cookieParser(process.env.COOKIE_SECRET),
  ];
}
