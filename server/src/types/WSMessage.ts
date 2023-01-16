

export type WSMessage = {
  type: WSMessageType
  sender: string,
  header: string,
  title?: string,
  text?: string,
  status?: string,
  data?: any,
  controllerKey?: string,
  time: Date,
}
export enum WSMessageType {
  LOG = "LOG", COMMAND = "COMMAND", REQUEST = "REQUEST", UPDATE = "UPDATE", FULL_LOG = "FULL_LOG",
  GAME_CONTEXT = "GAME_CONTEXT", CHOICE_CONTEXT = "CHOICE_CONTEXT", ROOM = "ROOM"
}

export enum WebControllerMessageType {
  CONTROLLER = "CONTROLLER",
  FULL_LOG = "FULL_LOG",
  ROOM = "ROOM",
  GAME_CONTEXT = "GAME_CONTEXT",
  CHOICE_CONTEXT = "CHOICE_CONTEXT"
}