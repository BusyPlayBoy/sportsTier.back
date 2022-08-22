import { Server } from "socket.io";
import { nicknameToSocketID, roomListSingleton } from "./utils.js";
import { searchMatch } from "../controllers/sports/matchMaker/matchMaking.js";
const nicknameToSocketIdSingleton = nicknameToSocketID.sharedInstance();
import initRpsMatchSocket from "./rps.js";
const roomList = roomListSingleton.sharedInstance();

/**
 * 매칭 관련 소켓 서버의 각종 이벤트를 등록하는 함수
 * @param {Server} serverSocket
 */
function initServerSocket(serverSocket) {
  serverSocket.on("connection", (clientSocket) => {
    console.log("Socket connection established: ", clientSocket.id);

    clientSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    clientSocket.on("error", (err) => {
      console.log(err);
      console.log("Socket disconnected");
    });

    clientSocket.on("matchMaking", async (data) => {
      let jsonData = JSON.parse(data);
      let nickname = jsonData.nickname;
      let sport = jsonData.sport;
      console.log(`${nickname}, ${sport} enqueue`);
      nicknameToSocketIdSingleton.setSocketID(nickname, clientSocket.id);
      // 매칭 큐에 {닉네임, 점수} 로 삽입 (await searchMatch)
      let match = await searchMatch(nickname, sport);
      let player;
      let playerElo;
      let opponent;
      let opponentElo;
      if (nickname === match.player1) {
        player = match.player1;
        playerElo = match.player1Elo;
        opponent = match.player2;
        opponentElo = match.player2Elo;
      } else {
        player = match.player2;
        playerElo = match.player2Elo;
        opponent = match.player1;
        opponentElo = match.player1Elo;
      }
      let roomId = match.roomId;
      let matchInfo = {
        player,
        playerElo,
        opponent,
        opponentElo,
        roomId,
        sport,
      };
      // 매치 정보를 클라이언트에 전송, 향후 해당 매치를 진행하겠다는 이벤트가 양 클라이언트로부터 받게되면,
      // 클라이언트들을 방에 넣고 게임시작
      clientSocket.emit("makedMatch", JSON.stringify(matchInfo));
    });

    clientSocket.on("matchEntry", (data) => {
      let jsonData = JSON.parse(data);
      let { player, playerElo, opponent, opponentElo, roomId, sport } = jsonData;
      clientSocket.join(roomId);
      if (!roomList.isRoomExisted(roomId)) roomList.addRoom(roomId);
      roomList.entryPlayer(roomId, player);
      let notification = { notification: `${player}이 입장했습니다.` };
      serverSocket.to(roomId).emit("matchNotification", JSON.stringify(notification));
      // 룸 내의 인원 수를 확인 후 2명이 된 경우 각 종목 matchStart 이벤트 발생
      if (roomList.roomSize(roomId) >= 2) {
        let sendData = {
          player1: player,
          player1Elo: playerElo,
          player2: opponent,
          player2Elo: opponentElo,
          roomId: roomId,
        };
        switch (sport) {
          case "rps":
            serverSocket.to(roomId).emit("rpsMatchStart", JSON.stringify(sendData));
            break;
          default:
            console.log("잘못된 종목명입니다.");
        }
      }
    });

    initRpsMatchSocket(clientSocket);
  });
}

export default initServerSocket;
