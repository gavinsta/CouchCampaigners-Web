import { ConnectionStatus } from "../types/enums/Status"
import Player from "./Player"

class WebController {
  key: string
  status: ConnectionStatus
  constructor(controllerKey: string) {
    this.key = controllerKey
    this.status = ConnectionStatus.DISCONNECTED
  }


}

export default WebController