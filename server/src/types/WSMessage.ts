
//TODO rework Full_log to not be the type of message, but the header
export type WSMessage = {
  type: WSMessageType
  sender: string,
  header: string,
  text?: string,
  status?: string,
  data?: string,
  controllerKey?: string,
  time: Date,
}
export enum WSMessageType {
  CHAT = "CHAT", LOG = "LOG", COMMAND = "COMMAND", REQUEST = "REQUEST", SERVER = "SERVER", UPDATE = "UPDATE", FULL_LOG = "FULL_LOG",
  GAME_CONTEXT = "GAME_CONTEXT", CHOICE_CONTEXT = "CHOICE_CONTEXT"
}