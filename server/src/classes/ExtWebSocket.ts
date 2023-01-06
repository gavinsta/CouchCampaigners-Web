import * as ws from "ws";
export default interface ExtWebSocket extends ws {
  isAlive: boolean;
  id: string;
}