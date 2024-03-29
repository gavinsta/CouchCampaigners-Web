import { useToast } from "@chakra-ui/react";
import { createContext, useContext, useState } from "react";
import { IncomingWSMessage, MessageType } from "../../types/ClientWSMessage";
import GameLog from "../../types/GameLog";
import { RoomInfo } from "../../types/RoomInfo";
import config from "../../config/index";
const siteURL = config.connectionURL || "ws://localhost:5050";

interface ContextType {
  roomInfo: RoomInfo | null;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;

  ws: WebSocket | null;
  sendWSText: (params: SendTextParams) => void;

  fullLog: GameLog[];
}
export const ConnectionContext = createContext<ContextType>({
  roomInfo: null,
  joinRoom: (roomCode: string, playerName: string) => {},
  leaveRoom: () => {},

  ws: null,
  sendWSText: () => {},
  fullLog: [],
});
export const ConnectionContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

  const [fullLog, setFullLog] = useState([]);

  const toast = useToast();

  async function joinRoom(roomCode: string, playerName: string) {
    if (roomInfo) return; //we shouldn't be triggering join room, if we are already in a room

    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("playerName", playerName);
    console.log(`Room code: ${roomCode} \nPlayer Name: ${playerName}`);
    establishWebSocketConnection(
      `${config.connectionURL}/?join=${roomCode}&name=${playerName}`
    );
  }

  function leaveRoom() {
    if (ws) ws.close();
    localStorage.removeItem("roomInfo");
    setRoomInfo(null);
    setFullLog([]);
    toast({
      title: "Left the Room",
      description: "Thanks for playing",
      position: "top",
      duration: 1000,
    });
  }

  function establishWebSocketConnection(wsURL: string) {
    //TODO pass a query to the server first to see if there is even a valid Room to join
    let ws = new WebSocket(wsURL);

    ws.onerror = ws.onmessage = ws.onopen = ws.onclose = null;
    ws.onerror = (e) => {
      console.log(e);
      toast({
        title: "Connection error",
        description: "Sorry, maybe the server is down?",
        position: "top",
        status: "error",
        duration: 800,
      });
      setRoomInfo(null);
      ws.close();
    };
    ws.onopen = function () {};
    ws.onclose = function () {
      setRoomInfo(null);
    };
    ws.onmessage = (event) => {
      const message: IncomingWSMessage = JSON.parse(event.data);
      console.log(
        `From: ${message.sender}, Type: ${message.type}, Header: ${message.header}`
      );
      const { type, data, textData, status, header } = message;
      if (type === "ROOM") {
        parseConnectionMessages(message);
        return;
      }
      if (type === "FULL_LOG") {
        if (!data) {
          console.error("FULL_LOG message did not contain log");
          return;
        }

        //all chat and log messages are sent in a bundle and the client can filter accordingly
        if (!data) {
          console.warn(`No data present in the chat log!`);
          return;
        }
        setFullLog(data);
        return;
      }
    };
    setWS(ws);
  }

  function sendText(params: SendTextParams) {
    const { type, header, title, text } = params;
    if (!ws || ws.readyState === ws.CLOSED) {
      console.error(`Trying to send WS message, but no websocket established!`);
      return;
    }

    if (!roomInfo) {
      console.error(`Trying to send WS message, but no room joined!`);
      return;
    }
    var playerName = roomInfo.playerName;

    //NO errors caught
    let message = {
      type: type,
      header: header,
      sender: playerName,
      time: new Date(),
      textData: {
        title: title,
        text: text,
      },
    };

    ws.send(JSON.stringify(message));
    console.log(message);
  }

  function parseConnectionMessages(message: any) {
    //type, sender, textData
    const { header, data, textData, status } = message;
    //console.log(message)
    if (status === "error") {
      toast({
        title: textData ? textData.title : header.split(":")[1],
        description: textData ? textData.text : "",
        status: "error",
        position: "top-left",
      });
    } else if (header === "join_room_status") {
      if (!data) {
        console.error("no room info!");
        toast({
          title: "No room info attached!",
          description: "We need the room info.",
          status: "error",
          position: "top-left",
        });
      } else {
        // console.log(data);
        setRoomInfo(data);
      }
    } else if (textData) {
      const showStatus: string = status ? status.toLowerCase() : "info";
      toast({
        title: textData.title,
        description: textData.text,
        status: showStatus as "success" | "info" | "error" | "warning",
      });
    }
    return;
  }

  return (
    <ConnectionContext.Provider
      value={{
        roomInfo,
        joinRoom,
        leaveRoom,
        //TODO maybe remove ws
        ws,
        sendWSText: sendText,

        fullLog,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnectionContext = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error(
      "useConnectionContext must be used within a ConnectionContextProvider"
    );
  }
  return context;
};

/**Messages to be sent to the server relating to ROOM and LOG functions */
export interface SendTextParams {
  type: MessageType.LOG | MessageType.ROOM;
  header: string;
  title?: string;
  text: string;
}
