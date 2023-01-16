export type IncomingWSMessage = {
  type: MessageType,
  header: string,
  sender: string,
  controllerKey?: string,
  textData?: {
    title: string,
    text: string,
  }

  status?: string,
  data?: any,
  time: Date
}

export enum MessageType {
  LOG = "LOG", FULL_LOG = "FULL_LOG", INPUT = "INPUT", ROOM = "ROOM", CONTROLLER = "CONTROLLER", CHOICE_CONTEXT = "CHOICE_CONTEXT", GAME_CONTEXT = "GAME_CONTEXT"
}
