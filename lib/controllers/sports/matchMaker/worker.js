import "dotenv/config";
import { randomUUID } from "node:crypto";
import { sleep } from "../../utils.js";
const defaultPlayerEloRange = 200;
const rangeUpdateSec = 15;
const rangeUpdateScore = 100;

/**
 * 매치메이킹 풀 내의 비슷한 실력의 사용자들에 대해 매칭해주는 함수
 * @param {import("@redis/client").RedisClientType} matchMakingPool
 * @param {import("@redis/client").RedisClientType} pub
 * @return {Promise<void>}
 */
async function findMatches(matchMakingPool, pub) {
  let list = await matchMakingPool.zRangeWithScores("matchMakingTime", 0, -1);
  for (let player of list) {
    let playerNickname = player.value;
    let playerElo = await matchMakingPool.zScore("matchMakingPool", playerNickname);
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
      let opponentNickname = opponent.value;
      let opponentQueueTime = await matchMakingPool.zScore("matchMakingTime", opponentNickname);
      if (!opponentQueueTime) continue;
      let opponentTimeInQueue = new Date().getTime() - opponentQueueTime;
      let opponentEloRange =
        defaultPlayerEloRange +
        parseInt(opponentTimeInQueue / rangeUpdateSec / 1000) * rangeUpdateScore;
      let opponentElo = opponent.score;
      if (
        opponentElo - opponentEloRange <= playerElo &&
        playerElo <= opponentElo + opponentEloRange &&
        playerNickname !== opponentNickname
      ) {
        possibleOpponents.push({
          nickname: opponentNickname,
          timeInQueue: opponentTimeInQueue,
          Elorating: opponentElo,
        });
      }
    }

    if (possibleOpponents.length > 0) {
      // timeInQueue 기준 내림차순 정렬
      possibleOpponents.sort((a, b) => b.timeInQueue - a.timeInQueue);
      let fixedOpponentNickname = possibleOpponents[0].nickname;
      let fixedOpponentElo = possibleOpponents[0].Elorating;
      await matchMakingPool.zRem("matchMakingTime", playerNickname);
      await matchMakingPool.zRem("matchMakingTime", fixedOpponentNickname);
      await matchMakingPool.zRem("matchMakingPool", playerNickname);
      await matchMakingPool.zRem("matchMakingPool", fixedOpponentNickname);
      publishMatch(
        pub,
        playerNickname,
        playerElo,
        fixedOpponentNickname,
        fixedOpponentElo,
        randomUUID()
      );
    }
  }
  return;
}

/**
 * 매치메이킹 결과를 pub을 통해 사용자들에게 전달하는 함수
 * @param {*} pub
 * @param {string} player1
 * @param {number} player1Elo
 * @param {string} player2
 * @param {number} player2Elo
 * @param {string} roomId
 */
async function publishMatch(pub, player1, player1Elo, player2, player2Elo, roomId) {
  const match = { player1, player1Elo, player2, player2Elo, roomId };
  await sleep(1);
  pub.publish("matches", JSON.stringify(match));
}

export default findMatches;
