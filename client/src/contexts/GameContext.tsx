import React, { createContext, useState, useEffect, useContext } from "react";
import { parse } from "uuid";
import { useToast } from '@chakra-ui/react'
import GameLog from "../types/GameLog";
import Choice from "../types/Choices";

interface ContextType {
  createToast: (title: string, text: string, status: "success" | "error" | "info" | "warning") => void

  gameState: string,
  setGameState: (gameState: string) => void

  roomCode: string,
  setRoomCode: (roomCode: string) => void

  playerName: string,
  setPlayerName: (name: string) => void

  fullLog: GameLog[],
  sendChat: (text: string) => void,

  inRoom: boolean,
  joinRoom: (roomCode: string) => void;
  createTestRoom: (roomCode: string) => void;
  leaveRoom: () => void,

  controllerKey: string,
  setControllerKey: (key: string) => void,
  controllerStatus: string,
  setControllerStatus: (status: string) => void,

  choiceContext: any,
  setChoiceContext: (context: any) => void,
  sendChoice: (choice: Choice) => void,

  requestUpdateGameContext: () => void,

  requestConnectController: () => void,
  requestDisconnectController: () => void
}

export const GameContext = createContext<ContextType>({
  createToast: () => { },
  gameState: "",
  setGameState: () => { },
  roomCode: "",
  setRoomCode: () => { },

  playerName: "",
  setPlayerName: () => { },

  fullLog: [],
  sendChat: (text: string) => { },

  inRoom: false,
  joinRoom: (roomCode: string) => { },
  createTestRoom: (roomCode: string) => { },
  leaveRoom: () => { },

  controllerKey: "",
  setControllerKey: (key: string) => { },
  controllerStatus: "",
  setControllerStatus: (status: string) => { },

  choiceContext: null,
  setChoiceContext: (context: any) => { },
  sendChoice: () => { },

  requestUpdateGameContext: () => { },

  requestConnectController: () => { },
  requestDisconnectController: () => { }
});

export const GameContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [gameState, setGameState] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [controllerKey, setControllerKey] = useState("");
  const [controllerStatus, setControllerStatus] = useState("none");

  const [fullLog, setFullLog] = useState([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [inRoom, setInRoom] = useState(false);
  const [choiceContext, setChoiceContext] = useState({});

  function joinRoom() {
    if (inRoom) return; //we shouldn't be triggering join room, if we are already in a room

    if (!roomCode) {
      createToast("Missing Room Code!", "Make sure you have a Room Code to join.", "warning");
      return;
    }
    if (!playerName) {
      createToast("Missing Player Name!", "Pick a name that your friends haven't picked yet.", "warning");
      return;
    }
    console.log(`Room code: ${roomCode} \nController Key: ${controllerKey} \nPlayer Name: ${playerName}`);
    establishWebSocketConnection();
  }

  function leaveRoom() {
    if (webSocket)
      webSocket.close();
    createToast("You left the Room", "Come back soon!", "info")
  }

  async function establishWebSocketConnection() {

    const wsURL = `ws://localhost:8080/?join=${roomCode}&name=${playerName}`
    //TODO pass a query to the server first to see if there is even a valid Room to join
    console.log(wsURL)
    let ws = new WebSocket(wsURL);
    ws.onerror = ws.onmessage = ws.onopen = ws.onclose = null;
    ws.onerror = (e) => {
    };
    ws.onopen = function () {
      setInRoom(true);
    };
    ws.onclose = function () {
      handleCloseConnection();
    };
    ws.onmessage = ((event) => {
      const message = JSON.parse(event.data);
      handleIncomingMessage(message);
    });
    setWebSocket(ws);

    requestUpdateGameContext();
  };

  function handleCloseConnection() {
    setInRoom(false);
    setControllerStatus("none");
    setFullLog([]);
  }
  useEffect(() => {
    if (controllerStatus == "none" || controllerStatus == "disconnected") {
      setChoiceContext({});
    }
  }, [controllerStatus]);

  function sendWSMessage(message: any, data?: any) {
    if (!webSocket) {
      console.log(`No websocket established!`)
      return
    }
    message.sender = playerName;
    message.controllerKey = controllerKey;
    message.data = JSON.stringify(data);
    webSocket.send(JSON.stringify(message))
  }


  function handleIncomingMessage(message: any) {
    const { type, header, sender, status, data, title, text } = message
    let parsedData;
    console.log(message)
    if (data) {
      parsedData = JSON.parse(data)
      if (parsedData) {
        console.log(parsedData);
      }
    }

    if (type === 'FULL_LOG' || type === 'LOG') {
      //all chat and log messages are sent in a bundle and the client can filter accordingly
      if (!parsedData) {
        console.warn(`No data present in the chat log!`)
        return;
      }
      setFullLog(parsedData);
      return;
    }
    if (type === 'UPDATE') {
      switch (header) {
        case "game_context":
          setGameState(parsedData.gameState);
          console.log(`Current Game State: ${gameState}`);
          break;
        case "controller_connection":
          console.log(`want to set status: ${status}`);
          if (controllerStatus !== status) {
            setControllerStatus(status);
          }
          break;
        case "choice_context":
          console.log("received choice context.");
          setChoiceContext(parsedData);
          break;
      }
      return;
    }
    if (type === 'room_stats') {
      //TODO format show room info to the player
      //clearSystemMessages();
      //showSystemMessage(obj.message);
    }
    if (type === 'SERVER_MESSAGE') {
      console.log(`${sender},${type},${header},${title},${data},${text}`)
      createToast(title, text, status)
      return;
    }
  }

  function sendLog(text: string) {
    const message = {
      type: "LOG",
      text: text,
      sender: playerName,
    }

    sendWSMessage(message);
  }

  function sendChat(text: string) {
    if (!inRoom) {
      createToast('Haven\'t joined a room!', 'You\'ve got nobody to talk to.', 'warning')
      return;
    }
    const message = {
      type: "CHAT",
      text: text,
      sender: playerName,
    }
    sendWSMessage(message);
    console.log(message);
  }
  /**
   * sends a choice object as a JSON string back to the server
   * @param {Choice} choice 
   */
  function sendChoice(choice: Choice) {
    const message = {
      type: "COMMAND",
      header: "choice",
      controllerKey: controllerKey,
      sender: playerName,
    }
    choice.controllerKey = controllerKey;
    sendWSMessage(message, choice);
  }

  function requestUpdateGameContext() {
    const message = {
      type: "REQUEST",
      header: "game_context"
    }
    sendWSMessage(message);
    console.log(message);
  }

  function requestConnectController() {
    const message = {
      type: "REQUEST",
      header: "controller_connection",
    }
    sendWSMessage(message)
    console.log(message);
  }

  function requestDisconnectController() {
    const message = {
      type: "REQUEST",
      header: "controller_disconnection",
    }
    sendWSMessage(message)
  }

  const toast = useToast()
  function createToast(title: string, text: string, status: "error" | "success" | "info" | "warning") {
    toast({
      title: title,
      description: text,
      status: status,
      duration: 2500,
      variant: 'subtle',
    })
  }

  function createTestRoom() {

  }
  //TODO add a paused screen when Host is disconnected
  return (
    <GameContext.Provider
      value={{
        createToast,

        gameState,
        setGameState,
        roomCode,
        setRoomCode,
        playerName,
        setPlayerName,

        fullLog,
        sendChat,

        inRoom,
        joinRoom,
        leaveRoom,
        createTestRoom,
        controllerKey,
        setControllerKey,
        controllerStatus,
        setControllerStatus,

        choiceContext,
        setChoiceContext,
        sendChoice,

        requestUpdateGameContext,

        requestConnectController,
        requestDisconnectController
      }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error(
      "useGameContext must be used within a GameContextProvider"
    );
  }
  return context;
};