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
 * 유사한 실력의 상대와 실시간 매칭 요청
 * @param {String} nickname matching을 원하는 사용자의 이메일
 * @param {String} sport matching을 원하는 종목 (ex."rps")
 * @return {Object} 매칭된 매치의 정보
 */
async function searchMatch(nickname, sport) {
  let eloRating;
  let sportCode = sportsId[sport];
  switch (sportCode) {
    // rps => 1
    case 1:
      eloRating = (await rpsUser.findOne({ nickname })).eloRating;
      break;
  }
  console.log(eloRating);
  await putUser(nickname, eloRating, sportCode);

  let match = await getMatch(nickname, sportCode);
  return match;
}

/**
 * 매칭 큐에 사용자를 삽입
 * @param {String} nickname 매칭 큐에 삽입할 사용자의 식별자
 * @param {Number} eloRating 해당 사용자의 elo 점수
 * @param {Number} sportCode 매칭을 진행할 스포츠 종목의 코드 (ex."rps"=>1)
 */
async function putUser(nickname, eloRating, sportCode) {
  const dbNum = sportCode * 2 - 1;
  const redisClientForMatchMakingPool = redis.createClient({
    host: "localhost",
    port: process.env.REDIS_PORT,
    db: dbNum,
  });
  redisClientForMatchMakingPool.connect();
  await redisClientForMatchMakingPool.zAdd("matchMakingPool", { score: eloRating, value: nickname });
  await redisClientForMatchMakingPool.zAdd("matchMakingTime", {
    score: new Date().getTime(),
    value: nickname,
  });

  await redisClientForMatchMakingPool.quit();
}

/**
 * Redis의 Pub/Sub을 이용하여 매칭 완료된 결과를 Publisher({@link matchMaker})로부터 받아온 뒤 반환
 * @param {String} nickname
 * @param {Number} sportCode
 * @returns
 */
async function getMatch(nickname, sportCode) {
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
      if (match.player1 === nickname || match.player2 === nickname) {
        redisClientToPutMatchFound.unsubscribe("matches");
        redisClientToPutMatchFound.quit();
        resolve(match);
      }
    });
  });
}

/**
 * 무한루프를 돌며 매칭 큐의 사용자들 중 비슷한 실력의 상대를 지속적으로 매칭
 * @param {String} sports 스포츠 종목 (ex. "rps")
 */
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
