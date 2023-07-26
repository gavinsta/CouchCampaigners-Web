import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import http from "http";
import { v4 } from "uuid";
import dotenv from "dotenv";
import cors from "cors";
import { generateKey } from "./utils/generator_functions";
//import { json } from "body-parser"
//const { format } = require('path');
import Room from "./classes/Room";
import path from "path";
import { ConnectionStatus, ResultStatus } from "./enums";
import HostGame from "./classes/HostGame";
import { WebSocketServer } from "ws";
import ExtWebSocket, {
  sendWebClientWSMessage,
  WSMessageType,
} from "./interfaces/ExtWebSocket";
import assetMaker from "./utils/asset-creation/assetMaker";
import getConsoleInput, {
  consoleInputEvent,
} from "./utils/testing/console_input";
import { findRoomFromCode, tryHostRoom } from "./utils/room_functions";
dotenv.config();
const { PORT, SESS_SECRET } = process.env;
const app: Express = express();

//
// Serve static files from the 'webapp' folder.
//
app.use(cors());

const app_path = path.join(__dirname, "../../client/build");
app.use(express.static(app_path));
//NOTE /assetmaker will be reserved for asset creation tools on the server

app.get("/admin", (req: Request, res: Response) => {
  res.send(
    `<h1>Server is in development mode!</h1><h2>NODE_ENV: ${process.env.NODE_ENV} <br/></h2>`
  );
});

app.get("/", function (req: Request, res: Response) {
  res.sendFile(path.join(app_path, "index.html"));
});
// app.use("/assetmaker", assetMaker);

app.get("/", (req: Request, res: Response) => {
  res.send(`<h1>Welcome to the main page!</h1>`);
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//
// Create an HTTP server.
//
const server = http.createServer(app);

//
// Create a WebSocket server completely detached from the HTTP server.
//
const wss = new WebSocketServer({ clientTracking: false, noServer: true });

server.on("upgrade", function (request, socket, head) {
  console.log("Parsing connection request...");
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", function (ws, request) {
  if (!request.url) {
    console.error(`WSS connection with no request URL`);
    return;
  }
  const extWs = ws as ExtWebSocket;
  extWs.id = v4(); //assign a new unique id for this ws
  extWs.isAlive = true;
  const queryString = request.url.split("?")[1];
  console.log(`Querying: ${queryString}`);
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has("host") && urlParams.has("controllerKeys")) {
    //url/?host=#ROOMCODE&controllerKeys
    const roomCode = urlParams.get("host")!;
    const controllerKeysString = urlParams.get("controllerKeys")!;
    console.log(`Controller Key String: ${controllerKeysString}`);
    const controllerKeys = controllerKeysString.split(",");
    console.log(`Controller Keys: ${controllerKeys}`);
    tryHostRoom(extWs, roomCode, controllerKeys);
  } else if (urlParams.has("join") && urlParams.has("name")) {
    const roomCode = urlParams.get("join")!;
    const playerName = urlParams.get("name")!;
    const room = findRoomFromCode(roomCode);
    if (room && playerName) {
      var result = room.tryJoinRoom(extWs, playerName);
      sendWebClientWSMessage(extWs, {
        type: WSMessageType.ROOM,
        sender: "room",
        header: "join_room_status",
        status: result.status,
        textData: result.textData,
        data: result.data,
      });
    } else {
      const errorText = `Could not find Room: ${roomCode}. Closing connection.`;
      // console.log(errorText);
      sendWebClientWSMessage(extWs, {
        type: WSMessageType.ROOM,
        sender: "server",
        header: "join_room_status",
        status: ResultStatus.ERROR,
        textData: { title: "Error connecting to room", text: errorText },
      });
      extWs.close();
      return;
    }
  } else {
    const errorText = "Unrecognized connection. Closing.";
    console.log(errorText);
    extWs.close();
    return;
  }
  //test the connection
  ws.ping();
});

/* TODO set up an interval ping that checks every five minutes if hosts are still connected to the rooms. Otherwise, start a timeout to close the room.
 * forreach room in rooms: host.ws.ping() to see if it is still alive
 */

wss.on("listening", () => {
  //console.log(`Server is listening on port:${WS_PORT}`);
});

//
// Start the server.
//
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  //NOTE create a Test room for looking at console output
  getConsoleInput();
});
