import { WSMessage, WSMessageType } from "../types/WSMessage";
import ExtWebSocket from "../classes/ExtWebSocket";
import { ResultStatus } from "../types/enums/Status";

interface WSMessageParams {
  type: string | WSMessageType,
  header: string,

  sender: string,
  title?: string,
  text?: string,
  status?: ResultStatus,
  controllerKey?: string,
}
/**
    * Packs a normal WebSocket message into a JSON format and also packs the data object into a JSON format
    * @param ws 
    * @param message 
    * @param data 
    * @param debug Whether this function will also print out console logs for easy reference
    */
function sendWSMessage(ws: ExtWebSocket, message: WSMessageParams, data?: any, debug = false) {
  const formattedMessage: WSMessage = {
    ...message,
    type: message.type as WSMessageType,
    time: new Date(),
    data: data,
  };
  /*
    if (data) {
      formattedMessage.data = JSON.stringify(data);
    }
    */
  ws.send(JSON.stringify(formattedMessage));
  if (debug) {
    console.log(`Sending to: ${ws.id}`)
    console.log(message)
  }
}
export { sendWSMessage }