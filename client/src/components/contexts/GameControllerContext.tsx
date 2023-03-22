import React, { createContext, useState, useEffect, useContext } from "react";
import { useToast } from '@chakra-ui/react'
import { Choice } from "../../types/ConnectionInterfaces";
import { useConnectionContext } from "./ConnectionContext";
import { IncomingWSMessage, MessageType } from "../../types/ClientWSMessage";
interface GameContext {
  sceneType: string,
  subSceneType: string,
  mode: string
}

interface Controller {
  key: string,
  playerName: string,
  status: string,
}

interface ContextType {

  gameContext: GameContext | null,
  setGameContext: (gameContext: GameContext) => void


  choiceContext: any,
  sendChoice: (choice: Choice, header?: string) => void,
  sendButtonInput: (fieldName: string, value: string | number) => void,
  requestGameContext: () => void,

  controller: Controller | null,
  requestConnectController: (controllerKey: string) => void,
  disconnectController: () => void,
}

export const GameControllerContext = createContext<ContextType>({

  gameContext: null,
  setGameContext: () => { },



  choiceContext: null,
  sendChoice: () => { },
  sendButtonInput: () => { },
  requestGameContext: () => { },

  controller: null,
  requestConnectController: () => { },
  disconnectController: () => { },
});

export const GameControllerContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [gameContext, setGameContext] = useState<GameContext | null>(null);


  const [choiceContext, setChoiceContext] = useState<any | null>(null);
  const { ws, roomInfo } = useConnectionContext();

  const [controller, setController] = useState<Controller | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (ws) {
      ws.addEventListener("message", listenWSEvent);
    }
    return (() => {
      ws?.removeEventListener("message", listenWSEvent);

    })
  }, [ws]);

  useEffect(() => {
    if (!roomInfo) {
      setController(null);
    }
  }, [roomInfo])
  function listenWSEvent(event: any) {
    const message = JSON.parse(event.data);
    //if (message.header === "GAME_CONTEXT" || message.header === "CHOICE_CONTEXT" || message.header === "CONTROLLER")
    parseIncomingMessage(message);
  }
  function parseIncomingMessage(message: IncomingWSMessage) {

    const { type, header, data, status, textData } = message;
    //console.log(`**GameController Parsing** ${header}`)
    let toastStatus: "info" | "error" | "warning" | "success" = "info"
    if (type === "CONTROLLER") {
      if (header === "controller_connect") {
        //console.log(`**${data.status}**`)
        if (status?.toLowerCase() === "success") {
          //console.log("Controller Confirmed!")
          toastStatus = "info"
          setController(data);
        }
        else if (status?.toLowerCase() === "error") {
          toastStatus = "error"
        }
      }
      toast({ title: textData?.title, description: textData?.text, status: toastStatus })
    }
    if (type === 'GAME_CONTEXT') {
      if (!data) {
        console.error(`UPDATE ${type} message ${header}: had data that was undefined`)
        return;
      }
      setGameContext(data);
      console.log(`Current Game Context\nScene Type: ${data?.sceneType}\nMode: ${data?.mode}`);
    }
    if (type === "CHOICE_CONTEXT") {
      if (!data) {
        console.error(`UPDATE ${type} message ${header}: had data that was undefined`)
        return;
      }
      console.log(`Current Choice Context**`);
      console.log(data)
      setChoiceContext(data);
    }
    return;
  }


  /**
   * sends a choice object as a JSON string back to the server
   * @param {Choice} choice 
   */
  function sendChoice(choice: Choice) {

    if (!ws || ws.readyState === ws.CLOSED) {
      console.error(`Trying to send WS message, but no websocket established!`)
      return
    }
    if (!roomInfo || !controller) {
      console.log(`Can't send choice if no Room Info or Controller`)
      return;
    }
    var playerName = roomInfo.playerName;
    var controllerKey = controller.key;
    //NO errors caught
    let message = {
      type: MessageType.INPUT,
      header: "choice",
      sender: playerName,
      //time: new Date(),
      controllerKey: controllerKey,
      data: {
        "choice": choice
      }
    }

    ws.send(JSON.stringify(message));
    console.log(message);
  }

  function sendButtonInput(fieldName: string, value: string | number) {
    //sendWSMessage()
    let message = {
      type: MessageType.INPUT,
      header: "button",
      inputData: {
        fieldName: fieldName,
        value: value
      }
    }
    if (ws) {
      ws.send(JSON.stringify(message));
    }
  }

  function requestConnectController(controllerKey: string) {
    if (!ws) {
      toast({ title: "Can't connect to server", status: "error" })
      console.log(`WebSocket is null`)
      return;
    }
    console.log('Requesting connection')
    const message = {
      type: MessageType.CONTROLLER,
      header: "controller_connect",
      data: {
        "key": controllerKey,
      }
    }
    ws.send(JSON.stringify(message));
  }

  function disconnectController() {
    if (!controller || !ws) {
      console.log(`Controller is already null!`)
      return;
    }
    const message = {
      type: MessageType.CONTROLLER,
      controllerKey: controller.key,
      header: "controller_disconnect",
      data: {
        "key": controller.key
      }
    }
    ws.send(JSON.stringify(message));
    setController(null);
    setGameContext(null);
  }
  //TODO finish request gameContext method
  /**
   * Method of individually requesting GameContext friom the server (e.g. due to disconnection)
   */
  function requestGameContext() {
    //sendWSMessage({ type: MessageType.GAME_CONTEXT, header: "get_game_context" });
  }

  //TODO add a paused screen when Host is disconnected
  return (
    <GameControllerContext.Provider
      value={{

        gameContext,
        setGameContext,



        choiceContext,
        sendChoice,
        sendButtonInput: sendButtonInput,
        requestGameContext,
        controller,
        requestConnectController,
        disconnectController,
      }}>
      {children}
    </GameControllerContext.Provider>
  );
}
export const useGameControllerContext = () => {
  const context = useContext(GameControllerContext);
  if (context === undefined) {
    throw new Error(
      "useGameContext must be used within a GameContextProvider"
    );
  }
  return context;
};