import { ConnectionStatus } from "../types/enums/Status";
import WebController from "./WebController";
import Room from "./Room";
import { WSMessage } from "../types/WSMessage";
import ExtWebSocket from "./ExtWebSocket";
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
  }

  /**
   * Assign a controller to the Player Object
   * @param {String} controllerKey 
   */
  assignController(controller: WebController) {
    this.controller = controller;
  }
  unassignController() {
    this.controller = null
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
      const message: WSMessage = JSON.parse(eventData);

      if (message.type == 'CHAT' || message.type == 'LOG') {
        this.room.newLog(message);
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
        this.room.parseClientCommand(message, this);
      }
      if (message.type == "REQUEST") {
        this.room.parseClientRequest(message, this);
      }
    });
    this.ws.on('close', () => {
      if (this.controller) {
        this.controller.disconnectPlayer();
      }
      this.room.removePlayerByName(this.name);
      const message = `${this.name} left the room.`;
      this.room.broadcast(message);

      if (this.room) {
        console.log(this.room.printStats());
      }
    });
  }

}
export default Player;