import { useEffect, useState } from "react";
import { Button, ButtonGroup, useToast, HStack } from '@chakra-ui/react'
import { useConnectionContext } from "../contexts/ConnectionContext";
import InputText from "../input-controls/InputText"
export function RoomControls({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) {
  const { joinRoom, leaveRoom, roomInfo } = useConnectionContext();
  const [roomCode, setRoomCode] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const toast = useToast();
  useEffect(() => {
    const prevName = localStorage.getItem("playerName");
    if (prevName) {
      setPlayerName(prevName)
    }
  }, [])

  useEffect(() => {
    const prevCode = localStorage.getItem("roomCode");
    if (prevCode) {
      setRoomCode(prevCode)
    }
  }, []);

  return (
    <ButtonGroup

      orientation={orientation}
      spacing={2}
      colorScheme={"blue"}>
      <HStack w={"100"}>
        <InputText
          value={playerName}
          setValue={setPlayerName}
          isActive={!roomInfo}
          label="NAME"
        />
        <InputText
          value={roomCode}
          setValue={setRoomCode}
          isActive={!roomInfo}
          label="CODE"
        />
      </HStack>

      <Button
        w={"100%"}
        onClick={() => {
          if (!roomCode) {
            toast({ position: "top-right", title: "Missing Room Code", status: "error", duration: 1000 })
            return;
          }
          if (!playerName) {
            toast({ position: "top-right", title: "Missing Player Name", status: "error", duration: 1000 })
            return;
          }

          if (roomInfo) { leaveRoom(); }
          else {

            joinRoom(roomCode, playerName);
          }
        }
        }>
        {roomInfo ? "Leave Room" : "Join Room"}
      </Button>

    </ButtonGroup>
  );

};