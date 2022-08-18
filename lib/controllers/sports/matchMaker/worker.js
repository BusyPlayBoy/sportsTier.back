import redis from "redis";
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { match } from "node:assert";
import { syncBuiltinESMExports } from "node:module";
const defaultPlayerEloRange = 200;
const rangeUpdateSec = 15;
const rangeUpdateScore = 100;

/**
 *
 * @param {import("@redis/client").RedisClientType} matchMakingPool
 * @param {import("@redis/client").RedisClientType} pub
 * @returns
 */
async function findMatches(matchMakingPool, pub) {
  let list = await matchMakingPool.zRangeWithScores("matchMakingTime", 0, -1);
  for (let player of list) {
    let playerEmail = player.value;
    let playerElo = await matchMakingPool.zScore("matchMakingPool", playerEmail);
    if (!playerElo) continue;
    let playerQueueTime = player.score;
    let playerTimeInQueue = new Date().getTime() - playerQueueTime;
    // 기본 상하 200점 시작, 그 후 15초마다 탐색 범위 상하 100추가
    let playerEloRange =
      defaultPlayerEloRange +
      parseInt(playerTimeInQueue / rangeUpdateSec / 1000) * rangeUpdateScore;
    let similarEloOpponents = await matchMakingPool.zRangeByScoreWithScores(
      "matchMakingPool",
      playerElo - playerEloRange,
      playerElo + playerEloRange
    );
    let possibleOpponents = [];
    for (let opponent of similarEloOpponents) {
      let opponentEmail = opponent.value;
      let opponentQueueTime = await matchMakingPool.zScore("matchMakingTime", opponentEmail);
      if (!opponentQueueTime) continue;
      let opponentTimeInQueue = new Date().getTime() - opponentQueueTime;
      let opponentEloRange =
        defaultPlayerEloRange +
        parseInt(opponentTimeInQueue / rangeUpdateSec / 1000) * rangeUpdateScore;
      let opponentElo = opponent.score;
      if (
        opponentElo - opponentEloRange <= playerElo &&
        playerElo <= opponentElo + opponentEloRange &&
        playerEmail !== opponentEmail
      ) {
        possibleOpponents.push({ email: opponentEmail, timeInQueue: opponentTimeInQueue });
      }
    }

    if (possibleOpponents.length > 0) {
      // timeInQueue 기준 내림차순 정렬
      possibleOpponents.sort((a, b) => b.timeInQueue - a.timeInQueue);
      let fixedOpponentEmail = possibleOpponents[0].email;
      await matchMakingPool.zRem("matchMakingTime", playerEmail);
      await matchMakingPool.zRem("matchMakingTime", fixedOpponentEmail);
      await matchMakingPool.zRem("matchMakingPool", playerEmail);
      await matchMakingPool.zRem("matchMakingPool", fixedOpponentEmail);
      publishMatch(pub, playerEmail, fixedOpponentEmail, randomUUID());
    }
  }
  return;
}

async function publishMatch(pub, player1Email, player2Email, roomId) {
  const match = { player1: player1Email, player2: player2Email, roomId: roomId };
  await sleep(1);
  pub.publish("matches", JSON.stringify(match));
}

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve,1000*sec));
}

export default findMatches;
