import express from "express";
import http from "node:http";
import publicMiddleware from "./lib/routes/middleware/index.js";
import "dotenv/config";
import accountRouter from "./lib/routes/account.js";
import sportsRouter from "./lib/routes/sports/index.js";
import { Server } from "socket.io";
import initServerSocket from "./lib/socket/index.js";
import "./mongo.js";
import {matchMaker} from "./lib/controllers/sports/matchMaker/matchMaking.js"
const app = express();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(publicMiddleware);
app.use("/account", accountRouter);
app.use("/sports", sportsRouter);

const serverSocket = new Server(server);
initServerSocket(serverSocket);

server.listen({ port: port, host: "localhost" }, () => {
  console.log(
    `express server connection established.... => ${server.address().address}:${
      server.address().port
    }`
  );
});

matchMaker("rps");