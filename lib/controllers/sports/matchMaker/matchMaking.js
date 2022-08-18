import rpsUser from "../../../models/user/rps.js";
import redis from "redis";
import "dotenv/config";
import { sportsId } from "../utils.js";
import path from "path";
const __dirname = path.resolve("./lib/controllers/sports/matchMaker");
const __filename = path.resolve(__dirname, "worker.js");
import { Worker } from "node:worker_threads";
import findMatches from "./worker.js";
/**
 *
 * @param {String} email
 * @param {String} sport
 * @return {Object} match
 */
async function searchMatch(email, sport) {
  let eloRating;
  let sportCode = sportsId[sport];
  switch (sportCode) {
    // rps => 1
    case 1:
      eloRating = (await rpsUser.findOne({ email })).eloRating;
      break;
  }
  console.log(eloRating);
  await putUser(email, eloRating, sportCode);

  let match = await getMatch(email, sportCode);
  return match;
}

async function putUser(email, eloRating, sportCode) {
  const dbNum = sportCode * 2 - 1;
  const redisClientForMatchMakingPool = redis.createClient({
    host: "localhost",
    port: process.env.REDIS_PORT,
    db: dbNum,
  });
  redisClientForMatchMakingPool.connect();
  await redisClientForMatchMakingPool.zAdd("matchMakingPool", { score: eloRating, value: email });
  await redisClientForMatchMakingPool.zAdd("matchMakingTime", {
    score: new Date().getTime(),
    value: email,
  });

  await redisClientForMatchMakingPool.quit();
}

async function getMatch(email, sportCode) {
  const dbNum = sportCode * 2;
  const redisClientToPutMatchFound = redis.createClient({
    host: "localhost",
    port: process.env.REDIS_PORT,
    db: dbNum,
  });
  await redisClientToPutMatchFound.connect();
  return new Promise((resolve) => {
    redisClientToPutMatchFound.subscribe("matches", (response) => {
      let match = JSON.parse(response);
      console.log(match);
      if (match.player1 === email || match.player2 === email) {
        redisClientToPutMatchFound.unsubscribe("matches");
        redisClientToPutMatchFound.quit();
        resolve(match);
      }
    });
  });
}

async function matchMaker(sports) {
  const sportCode = sportsId[sports];
  console.log(`${sports}(${sportCode}) matchMaker running...`);
  const poolDbNum = sportCode * 2 - 1;
  const pubDbNum = sportCode * 2;
  const matchMakingPool = redis.createClient({
    host: "localhost",
    port: process.env.REDIS_PORT,
    db: poolDbNum,
  });
  const pub = redis.createClient({
    host: "localhost",
    port: process.env.REDIS_PORT,
    db: pubDbNum,
  });
  console.log("pub");
  await matchMakingPool.connect();
  await pub.connect();
  while (true) {
    await findMatches(matchMakingPool, pub);
  }
}

export { searchMatch, matchMaker };
