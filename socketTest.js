import readline from "node:readline";
import { io } from "socket.io-client";

const question = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};
const clientSocket = io("http://127.0.0.1:3000");

clientSocket.on("join");

clientSocket.on("makedMatch", (data) => {
  let jsonData = JSON.parse(data);
  console.log("makedMatch:", data);
  clientSocket.emit("matchEntry", data);
});

clientSocket.on("matchNotification", (data) => {
  console.log("알림: ", data);
});
clientSocket.on("rpsMatchStart", async (data) => {
  let jsonData = JSON.parse(data);
  let player;
  let playerElo;
  let opponent;
  let opponentElo;
  console.log("이메일을 입력하세요");
  let inputEmail = await question("> ");
  if (inputEmail === jsonData.player1) {
    player = jsonData.player1;
    playerElo = jsonData.player1Elo;
    opponent = jsonData.player2;
    opponentElo = jsonData.player2Elo;
  } else {
    player = jsonData.player2;
    playerElo = jsonData.player2Elo;
    opponent = jsonData.player1;
    opponentElo = jsonData.player1Elo;
  }
  let roomId = jsonData.roomId;
  console.log("---------매치 시작!---------");
  let point = 0;
  clientSocket.on("rpsMatchRoundResult", (data) => {
    let {round,result} = JSON.parse(data);
    point += result;
    console.log(`포인트 변화 ${result}`);
    if (round>=5){
      if (point > 0) console.log("승리!");
    else if (point < 0) console.log("패배!");
    else console.log("무승부!");
    let sendData = { roomId, player, playerElo, opponent, opponentElo, point };
    clientSocket.emit("rpsMatchResult", JSON.stringify(sendData));
    }
  });
  for (let round = 1; round < 6; round++) {
    console.log(`${round}R 패를 입력하세요.(0: 묵, 1: 찌, 2: 빠) `);
    let handInput = await question(`> `);
    const hand = parseInt(handInput);
    let sendData = { roomId, player, opponent, round, hand };
    clientSocket.emit("rpsMatchRound", JSON.stringify(sendData));
  }
});

(async function () {
  let input = await question("command 입력 > ");
  let command = input.split(" ")[0];
  switch (command) {
    // matchMaking email sport 순으로 입력
    case "matchMaking":
      const [_, email, sport] = input.split(" ");
      clientSocket.emit("matchMaking", JSON.stringify({ email, sport }));
      break;
  }
})();

function sleep(sec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000 * sec);
  });
}
