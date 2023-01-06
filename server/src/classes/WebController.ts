import { ConnectionStatus } from "../types/enums/Status"
import Player from "./Player"

class WebController {
  key: string
  status: ConnectionStatus
  player?: Player
  constructor(controllerKey: string) {
    this.key = controllerKey
    this.status = ConnectionStatus.DISCONNECTED
  }

  connectPlayer(player: Player) {
    this.player = player
    this.player.assignController(this)
    //check that they are actually connected...
    this.status = ConnectionStatus.CONNECTED
  }

  disconnectPlayer() {
    if (this.player) {
      this.player.unassignController()
      this.player = undefined;
      this.status = ConnectionStatus.DISCONNECTED
    }
  }
}

export default WebController