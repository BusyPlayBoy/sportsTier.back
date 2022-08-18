import redis from "redis";
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { match } from "node:assert";
import { Worker, isMainThread, parentPort } from "node:worker_threads";

const defaultPlayerEloRange = 200;
const rangeUpdateSec = 15;
const rangeUpdateScore = 100;
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

while (true) {
  setTimeout(findMatches, 100);
}

async function findMatches() {
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
    let possibleOpponents = (
      await matchMakingPool.zRangeByScoreWithScores(
        "matchMakingPool",
        playerElo - playerEloRange,
        playerElo + playerEloRange
      )
    ).reduce((arr, opponent) => {
      let opponentEmail = opponent.value;
      let opponentQueueTime = matchMakingPool.zScore("matchMakingTime", opponentEmail);
      if (!opponentQueueTime) return arr;
      let opponentTimeInQueue = new Date().getTime() - opponentQueueTime;
      let opponentEloRange =
        defaultPlayerEloRange +
        parseInt((opponentTimeInQueue / rangeUpdateSec) * 1000) * rangeUpdateScore;
      let opponentElo = opponent.score;
      if (
        opponentElo - opponentEloRange <= playerElo &&
        playerElo <= opponentElo + opponentEloRange &&
        playerEmail !== opponentEmail
      ) {
        arr.push({ email: opponentEmail, timeInQueue: opponentTimeInQueue });
      }
      return arr;
    }, []);
    if (possibleOpponents) {
      // timeInQueue 기준 내림차순 정렬
      possibleOpponents.sort((a, b) => b.timeInQueue - a.timeInQueue);
      let fixedOpponentEmail = possibleOpponents[0].email;
      matchMakingPool.zRem("matchMakingTime", playerEmail);
      matchMakingPool.zRem("matchMakingTime", fixedOpponentEmail);
      matchMakingPool.zRem("matchMakingPool", playerEmail);
      matchMakingPool.zRem("matchMakingPool", fixedOpponentEmail);

      publishMatch(playerEmail, fixedOpponentEmail, randomUUID());
    }
  }
}

function publishMatch(player1Email, player2Email, roomId) {
  match = { player1: player1Email, player2: player2Email, roomId: roomId };
  pub.publish("matches", JSON.stringify(match));
}
