import express, { Express, Request, Response } from "express"
import bodyParser from "body-parser";
import http from "http"
import { v4 } from "uuid"
import dotenv from "dotenv"
import { generateKey } from "./utils/generator_functions"
//import { json } from "body-parser"
//const { format } = require('path');
import Room from "./classes/Room"
import Player from "./classes/Player";
import { ConnectionStatus, Status } from "./types/enums/Status";
import Host from "./classes/Host";
import { WebSocketServer, WebSocket } from "ws";
import ExtWebSocket from "./classes/ExtWebSocket";
import { WSMessageType, WSMessage } from "./types/WSMessage";
import { sendWSMessage } from "./utils/websocket_functions";


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

  var text = '';

  if (urlParams.has('host') && urlParams.has('controllerKeys')) {
    //url/?host=#ROOMCODE&controllerKeys
    const roomCode = urlParams.get('host')!;
    const controllerKeys = urlParams.get('controllerKeys')!;
    tryHostRoom(extWs, roomCode, controllerKeys)
  }

  else if (urlParams.has('join') && urlParams.has('name')) {
    const roomCode = urlParams.get('join')!;
    const playerName = urlParams.get('name')!;
    const room = findRoomFromCode(roomCode);
    if (room) {
      joinRoom(extWs, room, playerName);
    }
    else {
      const errorText = `Could not find Room: ${roomCode}. Closing connection.`
      ws.close();
      return;
    }
  }
  else {
    const errorText = "Unrecognized connection. Closing.";
    ws.close();
    return;
  }
  //test the connection
  ws.ping();
});
function tryHostRoom(extWs: ExtWebSocket, roomCode: string, controllerKeys: string) {
  const room = findRoomFromCode(roomCode);

  //there was already a room created before...
  if (room && room.host && room.host.status == ConnectionStatus.CONNECTED) {
    console.warn(`The room is already being hosted by ${room.host.id}`);
    extWs.close();
    return;
  }

  //create a new Host object
  const host = new Host(extWs);
  if (room) {
    //reconnect host
    room.connectNewHost(host);
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
 * @param {Host} host host
 * @param {string} controllerKeyString the url-encoded query string directly from the create-room connection request
 * @param {string} roomCode default none | can provide one for testing purposes or if we want a very unique identifier
 */
async function createNewRoom(host: Host, controllerKeyString: string, roomCode: string) {
  /** assign a room code **/
  let assignedRoomCode
  if (checkValidRoomCode(roomCode)) {
    assignedRoomCode = roomCode;
  }
  else {

    assignedRoomCode = 'TEST'//URGENT switch back to original code.
    // assignedRoomCode = generateKey(serverSettings.keyLength);
    // while (!checkValidRoomCode(assignedRoomCode)) {
    //     assignedRoomCode = generateKey(serverSettings.keyLength);
    // }
  }

  let controllerKeyList = JSON.parse(controllerKeyString);
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

  //send a confirmation message to the host
  const text = `Added new room: ${assignedRoomCode}.`;
  console.log(text);
  const data = {
    roomCode: assignedRoomCode,
    status: 'open',
    controllerKeys: controllerKeyList,
    text: room.printStats()
  }
  const message = {
    type: WSMessageType.SERVER,
    header: 'new_room',
    sender: 'server',
    title: 'New Room Created!',
    text: text,
    time: new Date()
  }
  sendWSMessage(host.ws, message, data);
}
/**
 * Join a room that is already open with the current player's name and websocket
 * @param ws 
 * @param room 
 * @param playerName 
 * @returns 
 */
function joinRoom(ws: ExtWebSocket, room: Room, playerName: string) {
  //
  // Joins a Room and set all the references
  //
  console.log(`${playerName} joining room ${room.roomCode} with ID: ${ws.id}`);

  const existingPlayer = room.findPlayerByName(playerName);
  if (existingPlayer) {
    if (existingPlayer.ws.readyState === WebSocket.OPEN) {
      //player exists and is connected...
      const errorText = `${playerName} already exists in room ${room.roomCode}. Try a different name.\nClosing Connection.`;
      sendServerMessage(ws, errorText);
      ws.close();
      return;
    }
    else {
      //player exists but isn't connected: remove the player before reconnecting.
      room.removePlayerByName(playerName)
      const text = `${playerName} is already in ${room.roomCode}.\nRemoving player.`;
      console.log(text);
    }
  }

  //create a new player!
  const player = new Player(ws, playerName, room);
  room.addPlayer(player);

  const text = `Session updated. ${playerName} joined room ${room.roomCode}.`;
  room.broadcast(text);

}

/**
 * Closes a room based on its room code.
 * @param {roomCode} room 
 */
function closeRoom(roomCode: string) {
  rooms = rooms.filter(room => room.roomCode !== roomCode);
}
/**
 * Send an error message back with just string
 * @param {WebSocket} ws 
 * @param {String} text the message text/string
 * @param {String} title default 'fail'
 * @param {String} status default 'error'
 */
function sendServerMessage(ws: ExtWebSocket, text: string, title: string = 'Error', header: string = 'Error', status: Status = Status.ERROR) {

  const data = {
    result: title,
    status: status
  }
  const message: WSMessage = {
    type: WSMessageType.SERVER,
    header: header,
    sender: 'server',
    status: status,
    text: text,
    data: JSON.stringify(data),
    time: new Date()
  }
  ws.send(JSON.stringify(message));
  console.error(`${text}`);
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

