import { ConnectionStatus } from "../enums";
import ExtWebSocket, { WSMessageType } from "../interfaces/ExtWebSocket";
import Room from "./Room";
import Player from "./Player";
import { logError } from "../utils/testing/color_console";

interface HostGameMessageParams {
  type:
    | WSMessageType.FULL_LOG
    | WSMessageType.COMMAND
    | WSMessageType.REQUEST
    | WSMessageType.ROOM;
  controllerKey?: string;
  header: string;
  sender: string;
  title?: string;
  text?: string;
  data?: any;
}
/** Class for managing the Unity Host Object of rooms (and connections) */
class HostGame {
  ws: ExtWebSocket;
  id: string;
  status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  room: Room | undefined;
  constructor(ws: ExtWebSocket) {
    this.ws = ws;
    this.id = ws.id;
    this.status = ConnectionStatus.CONNECTED;
    this.configureHostWebSocket();
  }

  configureHostWebSocket() {
    this.ws.on("pong", function heartbeat() {
      const extWs = this as ExtWebSocket;
      extWs.isAlive = true;
      console.log(`Received pong from: ${extWs.id}`);
      return;
    });
    this.ws.on("message", (eventData: string) => {
      console.log("***MESSAGE FROM HOST***");

      const message = JSON.parse(eventData);
      console.log("**PARSED MESSAGE");
      console.log(message);
      this.handleIncomingWSMessage(message);
    });

    this.ws.on("close", () => {
      if (this.room) {
        this.room.disconnectHost();
      }
    });
  }
  /**
   * These are all incoming messages sent from the HOST
   * @param message
   * @returns
   */
  //TODO add typing here!
  handleIncomingWSMessage(message: any) {
    if (!this.room) {
      console.error(
        `Received message for room from Host ${this.ws.id}, but room does not exist.`
      );
      return;
    }

    if (message.type == WSMessageType.LOG) {
      this.room.newLog({
        type: message.header,
        sender: message.sender,
        text: message.textData.text,
      });
    }
    if (message.type == WSMessageType.ROOM) {
    }
    if (message.type == WSMessageType.UPDATE) {
      //console.log(`Received UPDATE message`)
      switch (message.header) {
        case "choice_context":
          this.room.parsePlayerChoiceContext(message);
          break;
        case "game_context":
          this.room.parseGameContext(message);
      }
    }
  }

  /** Sending messages to the Unity Host requires subtly different JSONs. Data needs to be stringified to be parsed on C#-side. */
  send(params: HostGameMessageParams) {
    const { header, sender, type, controllerKey, data } = params;
    this.ws.send(
      JSON.stringify({
        header: header,
        sender: sender,
        type: type,
        controllerKey: controllerKey,
        data: data,
      })
    );

    //console.log(`Sent to Host:`);
    //console.log(params);
  }

  sendDisconnectControllerMessage(player: Player, controllerKey: string) {
    this.send({
      header: "controller_connection:disconnect",
      type: WSMessageType.ROOM,
      sender: "room",
      data: {
        controllerKey: controllerKey,
        playerName: player.name,
      },
    });
  }

  sendConnectControllerMessage(player: Player, controllerKey: string) {
    this.send({
      header: "controller_connection:connect",
      type: WSMessageType.ROOM,
      sender: "room",
      data: {
        playerName: player.name,
        controllerKey: controllerKey,
      },
    });
  }
}

export default HostGame;
