import rpsUser from "../../models/user/rps.js";
const sportsId = {
  rps: 1,
};
Object.freeze(sportsId);

const sportsToModel = {
  rps: rpsUser,
};
Object.freeze(sportsToModel);
/**
 * 매치 후 특정 플레이어의 db 기록 수정
 * @param {String} sport - 어떤 종목을 치른 것인지에 대한 식별자 (ex."rps","bowling")
 * @param {String} player - 매치 후 db 조정의 대상이 되는 플레이어의 식별자
 * @param {Number} point - 승리:양수, 무승부:0, 패배:음수
 * @param {Number} playerElo
 * @param {Number} opponentElo
 */
async function adjustAfterMatch(sport, player, point, playerElo, opponentElo) {
  let playerInDB;
  try {
    switch (sport) {
      case "rps":
        playerInDB = await rpsUser.findOne({ nickname: player });
        break;
      default:
        throw Error(`err: 올바르지 못한 종목 명 => ${sport}`);
    }
    console.log(playerInDB);
    let match = playerInDB.match;

    let weight;
    switch (true) {
      case match < 10:
        weight = 50;
        break;
      case 10 <= match && match < 30:
        weight = 30;
        break;
      case 30 <= match && match < 1400:
        weight = 20;
        break;
      default:
        weight = 10;
    }
    let result;
    if (point > 0) result = 1;
    else if (point === 0) result = 0.5;
    else if (point < 0) result = 0;
    else throw Error("파라미터 point의 값이 올바르지 않습니다.");
    let expectedWinProbability = 1 / (1 + 10 ** ((opponentElo - playerElo) / 400));
    let newEloRating = Math.round(playerElo + weight * (result - expectedWinProbability));
    let update = { eloRating: newEloRating, match: match + 1 };
    if (result === 1) update.win = playerInDB.win + 1;
    await rpsUser.findOneAndUpdate({ nickname: player }, update);
  } catch (err) {
    console.log(err);
  }
}

export { sportsId, sportsToModel, adjustAfterMatch };
