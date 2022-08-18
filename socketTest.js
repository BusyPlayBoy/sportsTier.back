import readline from "node:readline";
import { io } from "socket.io-client";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clientSocket = io("http://127.0.0.1:3000");

clientSocket.on("makedMatch", (data) => {
  console.log("makedMatch:", data);
});

rl.on("line", (input) => {
  const [email, sport] = input.split(" ");
  // clientSocket.id = from;
  // console.log(clientSocket.id);
  clientSocket.emit("matchmaking", JSON.stringify({ email, sport }));
});
