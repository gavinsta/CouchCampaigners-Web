import { ConnectionStatus, ResultStatus } from "../types/enums/Status";
import WebController from "./WebController";
import Room from "./Room";
import { WebControllerMessageType, WSMessage, WSMessageType } from "../types/WSMessage";
import ExtWebSocket from "./ExtWebSocket";
import { sendWSMessage } from "../utils/websocket_functions";
/**
 * Player object class.
 */
class Player {

  controller: WebController | null = null
  /**Player's name */
  name: string;
  /**The WebSocket connection of this Player object */
  ws: ExtWebSocket;
  id: string;

  room: Room;
  /**
   * 
   * @param {ExtWebSocket} ws 
   * @param {String} playerName 
   * @param {String} roomCode 
   */
  constructor(ws: ExtWebSocket, playerName: string, room: Room) {
    this.room = room;
    this.name = playerName;
    this.ws = ws;
    this.id = ws.id;
    this.configurePlayerWebsocket();
  }

  /**
   * Disconnects the player through the websocket
   */
  disconnectWebSocket() {
    this.ws.close();
    //this.ws = null;
    this.id = '';
  }

  configurePlayerWebsocket() {
    this.ws.on('message', (eventData: string) => {
      const message = JSON.parse(eventData);

      if (message.type == 'LOG') {
        this.room.newLog({ type: message.header, sender: message.sender, text: message.textData.text });
        return;
      }
      if (message.type == 'COMMAND') {
        //TODO send certain commands to Unity
        if (message.header == 'get_room_stats') {
          this.ws.send(JSON.stringify({
            type: 'SERVER',
            header: 'room_stats',
            data: this.room.printStats(),
          }));
          return;
        }
        //this.room.parseControllerInput(message, this);
      }
      if (message.type == "INPUT") {
        this.room.parseControllerInput(message, this);
      }
      //parse a request from a player
      if (message.type == "REQUEST") {
        this.room.parsePlayerUpdateRequest(message, this);
      }
      if (message.type === "ROOM") {

        this.room.parsePlayerRoomCommand(message, this);
      }
      if (message.type === "CONTROLLER") {
        this.room.parsePlayerControllerManagment(message, this);
      }
    });
    this.ws.on('close', () => {
      const message = `${this.name} left the room.`;
      this.room.broadcast(message);
      this.room.disconnectController(this);
      this.room.removePlayerByName(this.name);


      if (this.room) {
        console.log(this.room.printStats());
      }
    });
  }

  send(params: PlayerMessageParams) {
    const { type, header, sender, data, status } = params
    this.ws.send(JSON.stringify({
      type: type,
      header: header,
      controllerKey: this.controller?.key,
      status: status,
      sender: sender,
      data: data,
    }))
  }
}



interface PlayerMessageParams {
  header: string,
  type: WebControllerMessageType,
  sender: string,
  //controllerKey?: string,
  textData?: TextData,
  status?: string,
  inputData?: InputData,
  data?: any,
}

interface InputData {
  fieldName: string,
  value: string | number
}

interface TextData {
  title: string,
  text?: string,
}
export default Player;