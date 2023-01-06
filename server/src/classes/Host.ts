import { ConnectionStatus } from "../types/enums/Status";
import * as ws from "ws";
import { WSMessage, WSMessageType } from "../types/WSMessage";
import ExtWebSocket from "./ExtWebSocket";
import Room from "./Room";
/** Class for managing the Unity Host Object of rooms (and connections) */
class Host {
  ws: ExtWebSocket;
  id: string;
  status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  room: Room | undefined;
  constructor(ws: ExtWebSocket) {
    this.ws = ws;
    this.id = ws.id;
    this.status = ConnectionStatus.CONNECTED;
  }
  /**
   * Connects the Host to a new websocket
   * @param {WebSocket} ws 
   */
  connect(ws: ExtWebSocket) {
    this.ws = ws;
    if (ws.id) {
      this.id = ws.id;
    }
    this.status = ConnectionStatus.CONNECTED
  }
  /**Disconnects the current host's connection */
  disconnect() {
    if (this.ws.readyState === ws.OPEN) {
      this.ws.close();
    }
    this.id = ''
    this.status = ConnectionStatus.DISCONNECTED
  }

  configureHostWebSocket() {
    this.ws.on('pong', function heartbeat() {
      const extWs = this as ExtWebSocket
      extWs.isAlive = true;
      console.log(`Received pong from: ${extWs.id}`);
      return;
    });
    this.ws.on('message', (eventData: string) => {
      const message = JSON.parse(eventData);
      this.handleIncomingWSMessage(message);
    });

    this.ws.on('close', () => {
      const text = `Host left the room.`;
      if (this.room) {
        this.room.status.general = 'no_host';
        this.room.broadcast(text);
        console.log(this.room.printStats());
      }
    });

  }
  /**
   * 
   * @param message 
   * @returns 
   */
  handleIncomingWSMessage(message: WSMessage) {
    const room = this.room;
    if (!room) {
      console.log(`Received message for room from Host ${this.ws.id}, but room does not exist.`)
      return;
    }
    if (message.type == "CHAT") {
      message.sender = "host";
      room.newLog(message);
      console.log(`received message: ${message.text}`)
      return;
    }
    if (message.type == WSMessageType.LOG) {
      room.newLog(message);
      return;
    }
    if (message.type == "GAME_CONTEXT") {
      room.parseGameContext(message);
      return;
    }
    if (message.type == "CHOICE_CONTEXT") {
      room.parsePlayerChoiceContext(message);
    }
  }
}

export default Host