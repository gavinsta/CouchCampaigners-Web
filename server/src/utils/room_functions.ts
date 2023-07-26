import HostGame from "../classes/HostGame";
import Room from "../classes/Room";
import { ConnectionStatus } from "../enums";
import ExtWebSocket from "../interfaces/ExtWebSocket";
import {
  generateKey,
  defaultSettings,
  KeyGenerationSettings,
} from "./generator_functions";
import { consoleInputEvent } from "./testing/console_input";

//list of all the rooms being run
let rooms = new Map<string, Room>();

const timeOutDuration = 1000 * 60 * 3; //3 minutes

const MAX_ROOMS = 100;
const DEFAULT_MAX_PLAYERS = 6;
export async function createTestRoom(
  roomCode: string,
  controllerKeys: string[]
) {
  //creating a new room
  const room = new Room(roomCode.toUpperCase(), controllerKeys, null);

  rooms.set(roomCode, room);
  //console.log("Created test room: " + roomCode);
}
/**
 * A
 * @param host host (Unity Client)
 * @param controllerKeys list of Controller Keys directly from the create-room connection request
 * @param roomCode default none | can provide one for testing purposes or if we want a very unique identifier
 */
export async function createNewRoom(
  host: HostGame,
  controllerKeys: string[],
  roomCode: string
) {
  /** assign a room code **/
  let assignedRoomCode;
  if (checkValidRoomCode(roomCode)) {
    assignedRoomCode = roomCode;
  } else {
    assignedRoomCode = generateKey(
      defaultSettings.KEY_LENGTH,
      KeyGenerationSettings.NO_NUMBERS
    );
    while (!checkValidRoomCode(assignedRoomCode)) {
      assignedRoomCode = generateKey(defaultSettings.KEY_LENGTH);
    }
  }

  let controllerKeyList = controllerKeys;
  //substitute keys if none are provided
  if (controllerKeyList === undefined || controllerKeyList.length === 0) {
    //generate 4 stand-in keys
    for (var i = 0; i <= DEFAULT_MAX_PLAYERS; i++) {
      controllerKeyList.push(
        generateKey(
          defaultSettings.KEY_LENGTH,
          KeyGenerationSettings.ALTERNATING
        )
      );
    }
  }

  //creating a new room
  const room = new Room(assignedRoomCode, controllerKeyList, host);

  rooms.set(roomCode, room);
}

//TODO add return messages here
export function tryHostRoom(
  extWs: ExtWebSocket,
  roomCode: string,
  controllerKeys: string[]
) {
  const room = findRoomFromCode(roomCode);

  //there was already a room created before...
  if (room && room.host && room.host.status == ConnectionStatus.CONNECTED) {
    console.warn(`SERVER: The room is already being hosted by ${room.host.id}`);
    extWs.close();
    return;
  }

  //create a new Host object
  const host = new HostGame(extWs);
  if (room && room.controllers.size == controllerKeys.length) {
    //reconnect host
    room.reconnectHost(host);
  } else {
    //this is a host, without a room! create a new room!
    createNewRoom(host, controllerKeys, roomCode);
  }
}

/**
 * Closes a room based on its room code.
 * @param {roomCode} room
 */
export function removeRoomFromList(roomCode: string) {
  //delay 5 seconds before closing the room
  if (findRoomFromCode(roomCode)) {
    setTimeout(() => {
      rooms.delete(roomCode);
    }, 5000);
  }
}

/**
 * Check if a roomCode has already been used (When creating a new room)
 * @param {String} roomCode
 * @returns
 */
export function checkValidRoomCode(roomCode: string) {
  if (rooms.has(roomCode)) {
    return false;
  } else return true;
}

/**
 * Find a room given its Room Code
 * @param {String} roomCode
 * @returns {Room} the room object
 */
export function findRoomFromCode(roomCode: string): Room | null {
  const room = rooms.get(roomCode.toUpperCase());
  if (room) {
    return room;
  } else return null;
}
export function listAllRoomCodes(): string[] {
  const result: string[] = [];
  rooms.forEach((room, key) => {
    result.push(key);
  });
  return result;
}

export function listAllRoomStatus(): string[] {
  const result: string[] = [];
  rooms.forEach((room, key) => {
    result.push(key + ": " + room.status);
  });
  return result;
}
