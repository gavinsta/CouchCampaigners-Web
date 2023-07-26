// import { TextData } from "../interfaces";
// export type WSMessage = {
//   type: WSMessageType;
//   sender: string;
//   header: string;
//   title?: string;
//   text?: string;
//   status?: string;
//   data?: any;
//   controllerKey?: string;
//   time: Date;
// };
// export enum WSMessageType {
//   LOG = "LOG",
//   FULL_LOG = "FULL_LOG",
//   COMMAND = "COMMAND",
//   REQUEST = "REQUEST",
//   UPDATE = "UPDATE",

//   GAME_CONTEXT = "GAME_CONTEXT",
//   CHOICE_CONTEXT = "CHOICE_CONTEXT",
//   ROOM = "ROOM",
//   CONTROLLER = "CONTROLLER",
// }
// /**These are types that are only passed between the web-controller and the server */
// export type WebControllerMessageType =
//   | WSMessageType.CONTROLLER
//   | WSMessageType.ROOM
//   | WSMessageType.GAME_CONTEXT
//   | WSMessageType.CHOICE_CONTEXT
//   | WSMessageType.FULL_LOG;

// export type ClientOutWSMessage = {
//   time: Date;
//   type: WebControllerMessageType;
//   sender: "server" | "room";
//   header: string;
//   textData: TextData;
//   status?: string;
//   data?: any;
// };
