import { roomListMap } from "./utils.js";
import { adjustAfterMatch } from "../controllers/sports/utils.js";
import {sleep} from "../controllers/utils.js"
const roomList = roomListMap.rps;

/**
 * 가위 바위 보 매칭 서버 관련 소켓의 이벤트를 등록 
 * @param {Socket} clientSocket 
 */
function initRpsMatchSocket(clientSocket) {
  clientSocket.on("rpsMatchRound", async (data) => {
    let jsonData = JSON.parse(data);
    let { player, opponent, roomId, round, hand } = jsonData;
    // 묵: 0, 찌: 1, 빠: 2
    roomList.recordRoundResult(roomId,player,hand);
    while (round <= 5) {
      await sleep(1);
      let playerHand = roomList.getRoom(roomId)[player][round - 1];
      let opponentHand = roomList.getRoom(roomId)[opponent][round - 1];
      if (playerHand !== undefined && opponentHand !== undefined) {
        switch (true) {
          // player 승리 시나리오
          case (playerHand === 0 && opponentHand === 1) ||
            (playerHand === 1 && opponentHand === 2) ||
            (playerHand === 2 && opponentHand === 0):
            clientSocket.emit("rpsMatchRoundResult", JSON.stringify({ round: round, result: 1 }));
            break;
          // player 무승부 시나리오
          case (playerHand === 0 && opponentHand === 0) ||
            (playerHand === 1 && opponentHand === 1) ||
            (playerHand === 2 && opponentHand === 2):
            clientSocket.emit("rpsMatchRoundResult", JSON.stringify({ round: round, result: 0 }));
            break;
          // player 패배 시나리오
          case (playerHand === 0 && opponentHand === 2) ||
            (playerHand === 1 && opponentHand === 0) ||
            (playerHand === 2 && opponentHand === 1):
            clientSocket.emit("rpsMatchRoundResult", JSON.stringify({ round: round, result: -1 }));
            break;
        }
        break;
      }
    }
  });

  clientSocket.on("rpsMatchResult", async (data) => {
    let jsonData = JSON.parse(data);
    let player = jsonData.player;
    let playerElo = jsonData.playerElo;
    let opponentElo = jsonData.opponentElo;
    let roomId = jsonData.roomId;
    let point = jsonData.point;
    let sport = "rps";
    adjustAfterMatch(sport, player, point, playerElo, opponentElo);
    if (point > 0) {
      // 클라이언트의 elo 점수를 상승시킴
      console.log(`${player} 승리`);
    } else if (point < 0) {
      // 클라이언트 점수 깎음
      console.log(`${player} 패배`);
    } else {
      console.log(`${player} 무승부`);
    }
    await roomList.recordMatchResult(roomId,player,point);
    roomList.delRoom(roomId);
  });
}

export default initRpsMatchSocket;
