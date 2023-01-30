import express, { Express, Request, Response } from "express"
import bodyParser from "body-parser";
import http from "http"
import { v4 } from "uuid"
import dotenv from "dotenv"
import cors from "cors"
import { generateKey } from "./utils/generator_functions"
//import { json } from "body-parser"
//const { format } = require('path');
import Room from "./classes/Room"
import path from "path";
import { ConnectionStatus, ResultStatus } from "./types/enums/Status";
import Host from "./classes/Host";
import { WebSocketServer, WebSocket } from "ws";
import ExtWebSocket from "./classes/ExtWebSocket";
import assetMaker from "./utils/asset-creation/assetMaker";

dotenv.config()
const {
  PORT,
  SESS_SECRET,
} = process.env;
const app: Express = express();
const timeOutDuration = 1000 * 60 * 3;//3 minutes

//memory of all the rooms being run
let rooms: Room[] = [];

const serverSettings = {
  roomCodeLength: 6,
  keyLength: 5,
  keyRandom: false,
}
//
// Serve static files from the 'webapp' folder.
//
app.use(cors());

const app_path = path.join(__dirname, "../../client/build")
app.use(express.static(app_path))
//NOTE /assetmaker will be reserved for asset creation tools on the server
if (process.env.NODE_ENV === "development") {

  app.get('/home', (req: Request, res: Response) => {
    res.send(`<h1>Server is in development mode!</h1><h2>NODE_ENV: ${process.env.NODE_ENV} <br/></h2>`)
  })


  //TODO create separate router for the main app
  app.get("/app", function (req: Request, res: Response) {
    res.sendFile(path.join(app_path, "index.html"))
  })
  app.use("/assetmaker", assetMaker)

  app.get('/', (req: Request, res: Response) => {
    res.redirect('/home')
  });
}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
//
// Create an HTTP server.
//
const server = http.createServer(app);


//
// Create a WebSocket server completely detached from the HTTP server.
//
const wss = new WebSocketServer({ clientTracking: false, noServer: true });

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing connection request...');
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', function (ws, request) {
  if (!request.url) {
    console.error(`WSS connection with no request URL`)
    return;
  }
  const extWs = ws as ExtWebSocket
  extWs.id = v4(); //assign a new unique id for this ws
  extWs.isAlive = true;
  const queryString = request.url.split('?')[1];
  console.log(`Querying: ${queryString}`);
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('host') && urlParams.has('controllerKeys')) {
    //url/?host=#ROOMCODE&controllerKeys
    const roomCode = urlParams.get('host')!;
    const controllerKeysString = urlParams.get('controllerKeys')!;
    console.log(`Controller Key String: ${controllerKeysString}`)
    const controllerKeys = controllerKeysString.split(',');
    console.log(`Controller Keys: ${controllerKeys}`)
    tryHostRoom(extWs, roomCode, controllerKeys)
  }

  else if (urlParams.has('join') && urlParams.has('name')) {
    const roomCode = urlParams.get('join')!;
    const playerName = urlParams.get('name')!;
    const room = findRoomFromCode(roomCode);
    if (room) {
      room.joinRoom(extWs, playerName);
    }
    else {
      const errorText = `Could not find Room: ${roomCode}. Closing connection.`
      console.log(errorText);
      extWs.close();
      return;
    }
  }
  else {
    const errorText = "Unrecognized connection. Closing.";
    console.log(errorText)
    extWs.close();
    return;
  }
  //test the connection
  ws.ping();
});
function tryHostRoom(extWs: ExtWebSocket, roomCode: string, controllerKeys: string[]) {
  const room = findRoomFromCode(roomCode);

  //there was already a room created before...
  if (room && room.host && room.host.status == ConnectionStatus.CONNECTED) {
    console.warn(`SERVER: The room is already being hosted by ${room.host.id}`);
    extWs.close();
    return;
  }

  //create a new Host object
  const host = new Host(extWs);
  if (room) {
    //reconnect host
    room.reconnectHost(host);
  }
  else {
    //this is a host, without a room! create a new room!
    createNewRoom(host, controllerKeys, roomCode);
  }
}

/* TODO set up an interval ping that checks every five minutes if hosts are still connected to the rooms. Otherwise, start a timeout to close the room.
* forreach room in rooms: host.ws.ping() to see if it is still alive
*/

wss.on('listening', () => {
  console.log(`Server is listening on port:${PORT}`);
});

//
// Start the server.
//
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  //NOTE create a Test room for looking at console output
  //createTestRoom();
});

/**
 * A
 * @param host host (Unity Client)
 * @param controllerKey list of Controller Keys directly from the create-room connection request
 * @param roomCode default none | can provide one for testing purposes or if we want a very unique identifier
 */
async function createNewRoom(host: Host, controllerKey: string[], roomCode: string) {
  /** assign a room code **/
  let assignedRoomCode
  if (checkValidRoomCode(roomCode)) {
    assignedRoomCode = roomCode;
  }
  else {

    assignedRoomCode = 'FALLBACK'//URGENT switch back to original code.
    // assignedRoomCode = generateKey(serverSettings.keyLength);
    // while (!checkValidRoomCode(assignedRoomCode)) {
    //     assignedRoomCode = generateKey(serverSettings.keyLength);
    // }
  }

  let controllerKeyList = controllerKey;
  //substitute keys if none are provided
  if (controllerKeyList === undefined || controllerKeyList.length === 0) {
    //generate 4 stand-in keys
    for (var i = 0; i < 5; i++) {
      controllerKeyList.push(generateKey(serverSettings.keyLength, serverSettings.keyRandom));
    }
  }

  //creating a new room
  const room = new Room(assignedRoomCode, controllerKeyList, host);

  rooms.push(room);
}

/**
 * Closes a room based on its room code.
 * @param {roomCode} room 
 */
function closeRoom(roomCode: string) {
  rooms = rooms.filter(room => room.roomCode !== roomCode);
}

let roomCodes = new Set<string>();
/**
 * Check if a roomCode has already been used (When creating a new room)
 * @param {String} roomCode 
 * @returns 
 */
function checkValidRoomCode(roomCode: string) {
  if (roomCodes.has(roomCode)) {
    return false;
  }
  else return true;
}

/**
 * Find a room given its Room Code
 * @param {String} roomCode 
 * @returns {Room} the room object
 */
function findRoomFromCode(roomCode: string): Room | null {
  const room = rooms.find(room => room.roomCode === roomCode);
  if (room) {
    return room;
  }
  else return null;
}

