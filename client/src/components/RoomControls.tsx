import React, { useRef, useEffect, useState } from "react";
import { useGameContext } from "../contexts/GameContext";
import { Button, Input, ButtonGroup, Stack, useToast, ToastId } from '@chakra-ui/react'
export function RoomControls() {
  const { createToast, inRoom, joinRoom, leaveRoom, roomCode, setRoomCode, playerName, setPlayerName,
    controllerKey, setControllerKey, controllerStatus, setControllerStatus,
    requestConnectController, requestDisconnectController
  } = useGameContext();
  const [systemMessage, setSystemMessage] = useState();
  const [connectControllerButtonText, setConnectControllerButtonText] = useState("Connect Controller");
  const toast = useToast();
  const connectionToastIdRef = useRef<ToastId>("");
  function checkConnection() {
    let text = ""
    let status = 'info'
    switch (controllerStatus) {
      case "pending":
        text = `Connecting to controller ${controllerKey}.`;
        status = 'warning'
        break;
      case "connected":
        text = `Connected successfully to ${controllerKey}`;
        status = 'success'
        break;
      case "fail":
        text = `Failed to connect to controller.`;
        status = 'error'
        break;
      case "disconnected":
        text = `Successfully disconnected.`
        status = `info`
    }
    if (controllerStatus !== "none" && !toast.isActive(connectionToastIdRef.current)) {
      connectionToastIdRef.current = toast({
        duration: 2500,
        status: status as "success" | "info" | "error" | "warning",
        title: text,
        variant: 'subtle',
      });
    }
    else {
      toast.update(connectionToastIdRef.current, {
        duration: 2500,
        status: status as "success" | "info" | "error" | "warning",
        title: text,
        variant: 'subtle',
      })
    }

    return;
  }
  function connectController() {
    if (controllerStatus != "connected" && controllerStatus != "pending") {
      setControllerStatus("pending");
      console.log('Requesting connection')
      requestConnectController();

    }
    else if (controllerStatus == "connected") {
      handleDisconnectController();

    }
  }
  function handleDisconnectController() {
    requestDisconnectController();

  }

  useEffect(() => {
    if (controllerStatus == "connected") {
      console.log(`Connected to ${controllerKey}`);
      setConnectControllerButtonText("Disconnect Controller");
    }
    else {
      setConnectControllerButtonText("Connect Controller");
    }

    checkConnection();
  }, [controllerStatus]);
  return (
    <Stack
      h={'10vh'}
      padding={2}
      spacing={2}
    >
      <ButtonGroup
        spacing={2}
        colorScheme={"govy"}>
        <InputText
          value={playerName}
          setValue={setPlayerName}
          isActive={!inRoom}
          label="NAME"
        />
        <InputText
          value={roomCode}
          setValue={setRoomCode}
          isActive={!inRoom}
          label="CODE"
        />
        {!inRoom ?
          <Button
            onClick={() => {
              inRoom ? leaveRoom() : joinRoom(roomCode)
            }
            }>
            {inRoom ? "Leave Room" : "Join Room"}
          </Button>
          :
          <Button
            onClick={leaveRoom}>
            Leave Room
          </Button>
        }
        <InputText
          value={controllerKey}
          setValue={setControllerKey}
          isActive={controllerStatus == "connected" ? false : true}
          label={"KEY | " + controllerStatus}
        />
        <Button
          onClick={connectController}
          disabled={!inRoom}
        >
          {connectControllerButtonText}
        </Button>
      </ButtonGroup>
    </Stack>
  );

};

export function InputText({ isActive = true, label, value, setValue }: { isActive: boolean, label: string, value: string, setValue: (val: string) => void }) {
  return (
    <Input
      w={'20%'}
      placeholder={label}
      value={value}
      onChange={e => {
        if (isActive) setValue(e.target.value.toUpperCase())
      }}
      disabled={!isActive} />
  )
}