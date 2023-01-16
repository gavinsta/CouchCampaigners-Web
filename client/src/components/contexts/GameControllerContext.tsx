import React, { createContext, useState, useEffect, useContext } from "react";
import { parse } from "uuid";
import { useToast } from '@chakra-ui/react'
import GameLog from "../../types/GameLog";
import { Choice } from "../../types/ConnectionInterfaces";
import { useConnectionContext } from "./ConnectionContext";
import { IncomingWSMessage, MessageType } from "../../types/ClientWSMessage";
import { Stats } from "fs";
interface GameContext {
  sceneType: string,
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
  sendInput: (fieldName: string, value: string | number) => void,
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
  sendInput: () => { },
  requestGameContext: () => { },

  controller: null,
  requestConnectController: () => { },
  disconnectController: () => { },
});

export const GameControllerContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [gameContext, setGameContext] = useState<GameContext | null>(null);


  const [choiceContext, setChoiceContext] = useState({});
  const { ws, roomInfo } = useConnectionContext();

  const [controller, setController] = useState<Controller | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (ws) {
      ws.addEventListener("message", listenWSEvent);
    }
    return (() => {
      ws?.removeEventListener("message", listenWSEvent)
    })

  }, [ws]);
  function listenWSEvent(event: any) {
    const message = JSON.parse(event.data);
    parseIncomingMessage(message);
  }
  function parseIncomingMessage(message: IncomingWSMessage) {

    const { type, header, data, status, textData } = message;
    console.log(`**GameController Parsing** ${header}`)
    if (type === "CONTROLLER") {
      if (header === "controller_connect") {
        //console.log(`**${data.status}**`)
        if (status?.toLowerCase() === "success") {
          console.log("Controller Confirmed!")
          setController(data);
        }
      }
      toast({ title: textData?.title, description: textData?.text, status: "info" })
    }
    if (type === 'GAME_CONTEXT') {
      if (!data) {
        console.error(`UPDATE ${type} message ${header}: had data that was undefined`)
        return;
      }
      setGameContext(data);
      console.log(`Current Game Context\nScene Type: ${gameContext?.sceneType}\nMode: ${gameContext?.mode}`);
    }
    if (type === "CHOICE_CONTEXT") {
      if (!data) {
        console.error(`UPDATE ${type} message ${header}: had data that was undefined`)
        return;
      }
      console.log(`Current Choice Context ${choiceContext}`);

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

  function sendInput(fieldName: string, value: string | number) {
    //sendWSMessage()
    let message = {
      type: MessageType.INPUT,
      header: "button",
      inputData: {
        fieldName: fieldName,
        value: value
      }
    }
    ws!.send(JSON.stringify(message));
  }

  function requestConnectController(controllerKey: string) {
    if (!ws) {
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
      type: MessageType.ROOM,
      controllerKey: controller.key,
      header: "controller_disconnect",
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
        sendInput,
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