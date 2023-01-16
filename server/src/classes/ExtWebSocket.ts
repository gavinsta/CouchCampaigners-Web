import { WebSocket } from "ws";
/**
 * Extends WebSocket interface from ws.
 */
export default interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
}