import redis from "redis";
import "dotenv/config";

const defaultPlayerEloRange = 200;
const rangeUpdateSec = 15;
const rangeUpdateScore = 100;

async function findMatches(sportCode) {
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
  let list = await matchMakingPool.zRangeWithScores("matchMakingTime");
  for (let player of list) {
    let playerEmail = player.value;
    let playerElo = matchMakingPool.zScore("matchMakingPool", playerEmail);
    if (!playerElo) continue;
    let playerQueueTime = player.score;
    let playerTimeInQueue = new Date().getTime() - playerQueueTime;
    // 기본 상하 200점 시작, 그 후 15초마다 탐색 범위 상하 100추가
    let playerEloRange =
      defaultPlayerEloRange +
      parseInt((playerTimeInQueue / rangeUpdateSec) * 1000) * rangeUpdateScore;
    let possibleOpponents = [];
    for (let opponent of await matchMakingPool.zRangeByScoreWithScores(
      "matchMakingPool",
      playerElo - playerEloRange,
      playerElo + playerEloRange
    )) {
    }
  }
}
