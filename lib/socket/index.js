import { Server } from "socket.io";
import {emailToSocketID} from "./utils.js"
import searchMatch from "../controllers/sports/matchMaker/matchMaking.js";
const emailToSocketIdSingleton = emailToSocketID.sharedInstance();

/**
 *
 * @param {Server} serverSocket
 */
function initServerSocket(serverSocket) {
  serverSocket.on("connection", (clientSocket) => {
    console.log("Socket connection established: ", clientSocket.id);
    // 클라이언트에게 메세지 송신, 이 때 통신의 주체에게는 메세지가 가지 않음
    clientSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    clientSocket.on("error", (err) => {
      console.log(err);
      console.log("Socket disconnected");
    });
    // 클라이언트로 부터 메세지를 수신
    clientSocket.on("chatting", (data) => {
      // 웹 소켓을 통해 chatting 통신이 서버에 도착 시
      console.log(`chatting: ${data}`);
      console.log(clientSocket.id);
      clientSocket.emit("chatting", data);
    });
    clientSocket.on("matchMaking", async (data) => {
        let jsonData = JSON.parse(data);
        let email = jsonData.email;
        let sport = jsonData.sport;
        emailToSocketIdSingleton.setSocketID(email,clientSocket.id);
        // 매칭 큐에 {이메일, 점수} 로 삽입 (await searchMatch)
        let match = await searchMatch(email,sport);
        // 매치 id로 room 을 생성 후 사용자 삽입
        clientSocket.join(match.roomId);
        serverSocket.to(match.roomId).emit("makedMatch",match);
    });
  });
}

export default initServerSocket;
