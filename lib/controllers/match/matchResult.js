import { verifyAccess } from "../account/forJwt.js";
import { sportsToMatchModel } from "./utils.js";

/**
 * 요청 사용자의 가위바위보 매치 결과 정보를 반환
 * @param {*} req http request
 * @param {*} res http response
 */
async function getRpsMatchResultList(req, res) {
  const accessToken = verifyAccess(req.signedCookies?.accessToken);
  if (!accessToken.isValid) res.redirect(307, req.originalUrl);
  const nickname = accessToken.nickname;
  let rpsMatchDataList = await sportsToMatchModel.rps.find({
    $or: [{ player1: nickname }, { player2: nickname }],
  });
  let sendRpsMatchDataList = rpsMatchDataList.reduce((arr, match) => {
    let matchData = {};
    // winner 0: 무승부, 1:사용자 승리, 2: 사용자 패배
    if (match.player1 === nickname) {
      matchData.player = match.player1;
      matchData.playerRecord = match.player1Record;
      matchData.opponent = match.player2;
      matchData.opponentRecord = match.player2Record;
      if (match.winner === 0) matchData.winner = 0;
      else if (match.winner === 1) matchData.winner = 1;
      else matchData.winner = 2;
    } else {
      matchData.player = match.player2;
      matchData.playerRecord = match.player2Record;
      matchData.opponent = match.player1;
      matchData.opponentRecord = match.player1Record;
      if (match.winner === 0) matchData.winner = 0;
      else if (match.winner === 1) matchData.winner = 2;
      else matchData.winner = 1;
    }
    arr.push(matchData);
    return arr;
  }, []);
  res.status(200).json(sendRpsMatchDataList);
}

export { getRpsMatchResultList };
