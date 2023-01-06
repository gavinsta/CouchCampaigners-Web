import { WSMessage } from "../types/WSMessage";
import ExtWebSocket from "../classes/ExtWebSocket";
/**
    * Packs a normal WebSocket message into a JSON format and also packs the data object into a JSON format
    * @param ws 
    * @param message 
    * @param data 
    * @param debug Whether this function will also print out console logs for easy reference
    */
function sendWSMessage(ws: ExtWebSocket, message: WSMessage, data?: any, debug = false) {
  const formattedMessage = message;
  if (data) {
    formattedMessage.data = JSON.stringify(data);
  }
  ws.send(JSON.stringify(formattedMessage));
  if (debug) {
    console.log(`Sending to: ${ws.id}`)
    console.log(message)
  }
}

export { sendWSMessage }