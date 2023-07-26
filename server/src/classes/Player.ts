import { ConnectionStatus, ResultStatus } from "../enums";
import WebController from "./WebController";
import Room from "./Room";
import ExtWebSocket, {
  sendWebClientWSMessage,
  WebClientOutWSMessageParams,
} from "../interfaces/ExtWebSocket";
import { InputData, TextData } from "../interfaces";

/**
 * Player object class.
 */
class Player {
  controller: WebController | null = null;
  /**Player's name */
  name: string;
  /**The Extended WebSocket Object of this Player object */
  ws: ExtWebSocket;
  id: string;

  room: Room;

  isHostPlayer: boolean = false;
  /**
   *
   * @param {ExtWebSocket} ws Extended Websocket object ref
   * @param {String} playerName
   * @param {Room} room A reference to the room this player occupies
   */
  constructor(
    ws: ExtWebSocket,
    playerName: string,
    room: Room,
    isHostPlayer: boolean = false
  ) {
    this.room = room;
    this.name = playerName;
    this.ws = ws;
    this.id = ws.id;
    this.configurePlayerWebsocket();
    this.isHostPlayer = isHostPlayer;
  }

  /**
   * Disconnects the player through the websocket
   */
  disconnectWebSocket() {
    this.ws.close();
    //this.ws = null;
    this.id = "";
  }

  configurePlayerWebsocket() {
    this.ws.on("message", (eventData: string) => {
      const message = JSON.parse(eventData);

      if (message.type == "LOG") {
        this.room.newLog({
          type: message.header,
          sender: message.sender,
          text: message.textData.text,
        });
        return;
      }
      if (message.type == "COMMAND") {
        //TODO send certain commands to Unity
        if (message.header == "get_room_stats") {
          this.ws.send(
            JSON.stringify({
              type: "SERVER",
              header: "room_stats",
              data: this.room.printStats(),
            })
          );
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
    this.ws.on("close", () => {
      const message = `${this.name} left the room.`;
      this.room.broadcast(message);
      this.room.disconnectController(this);
      this.room.removePlayerByName(this.name);

      if (this.room) {
        console.log(this.room.printStats());
      }
    });
  }

  /**Sends a message out to the WebClient.
   * Short hand for calling sendWebClientWSMessage */
  send(params: WebClientOutWSMessageParams) {
    sendWebClientWSMessage(this.ws, params);
  }
}

export default Player;
