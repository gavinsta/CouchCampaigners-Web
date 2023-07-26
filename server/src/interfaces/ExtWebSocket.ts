import { WebSocket } from "ws";
/**
 * Extends WebSocket interface from ws.
 */
import { InputData, TextData } from ".";
export type WSMessage = {
  type: WSMessageType;
  sender: string;
  header: string;
  title?: string;
  text?: string;
  status?: string;
  data?: any;
  controllerKey?: string;
  time: Date;
};
export enum WSMessageType {
  LOG = "LOG",
  FULL_LOG = "FULL_LOG",
  COMMAND = "COMMAND",
  REQUEST = "REQUEST",
  UPDATE = "UPDATE",

  GAME_CONTEXT = "GAME_CONTEXT",
  CHOICE_CONTEXT = "CHOICE_CONTEXT",
  ROOM = "ROOM",
  CONTROLLER = "CONTROLLER",
}
/**These are types that are only passed between the web-controller and the server */
export type WebControllerMessageType =
  | WSMessageType.CONTROLLER
  | WSMessageType.ROOM
  | WSMessageType.GAME_CONTEXT
  | WSMessageType.CHOICE_CONTEXT
  | WSMessageType.FULL_LOG;

type FinalWebClientOutWSMessage = {
  time: Date;
  type: WebControllerMessageType;
  sender: "server" | "room";
  header: string;
  textData?: TextData;
  status?: string;
  data?: any;
};

export interface WebClientOutWSMessageParams {
  type: WebControllerMessageType;
  sender: "server" | "room";
  header: string;
  textData?: TextData;
  status?: string;
  data?: any;
  debug?: boolean;
}

export default interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
}

export function sendWebClientWSMessage(
  ws: ExtWebSocket,
  params: WebClientOutWSMessageParams
) {
  const { type, sender, header, textData, status, data, debug } = params;
  const message: FinalWebClientOutWSMessage = {
    time: new Date(),
    type: type,
    sender: sender,
    header: header,
    status: status,
    textData: textData,
    data: data,
  };
  ws.send(JSON.stringify(message));
  if (debug) {
    console.log(`Sending to: ${ws.id} the following message:\n\n${message}`);
  }
}
interface UnityOutWSMessageParams {
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
export function sendUnityWSMessage(
  ws: ExtWebSocket,
  params: UnityOutWSMessageParams
) {}
