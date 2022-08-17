import rpsUser from "../../../models/user/rps.js";
import redis from "redis";
import "dotenv/config";
import { sportsId } from "../utils.js";
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

  await redisClientForMatchMakingPool.zAdd("matchMakingPool", eloRating, email);
  await redisClientForMatchMakingPool.zAdd("matchMakingTime", new Date().getTime(), email);

  await redisClientForMatchMakingPool.quit();
}

async function getMatch(email, sportCode) {
  const dbNum = sportCode * 2;
  const redisClientToPutMatchFound = redis.createClient({
    host: "localhost",
    port: process.env.REDIS_PORT,
    db: dbNum,
  });
  return new Promise((resolve) => {
    redisClientToPutMatchFound.subscribe("matches", (response) => {
      let match = JSON.parse(response);
      if (match.player1 === email || match.player2 === email) {
        redisClientToPutMatchFound.unsubscribe("matches");
        redisClientToPutMatchFound.quit();
        resolve(match);
      }
    });
  });
}

export default searchMatch;
