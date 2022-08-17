import readline from "node:readline";
import { io } from "socket.io-client";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clientSocket = io("http://127.0.0.1:3000");

clientSocket.on("chatting",(data)=>{
    console.log("chatting:",data);
})

rl.on("line", (input) => {
  const [from,to,msg] = input.split(" ");
  clientSocket.id = from;
  console.log(clientSocket.id);
  clientSocket.emit("chatting", JSON.stringify({ head: "chat", body: msg, to: to,from:from }));
});
