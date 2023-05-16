import { useEffect, useState } from "react";
import { Button, ButtonGroup, useToast, HStack, Stack } from '@chakra-ui/react'
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
    <ButtonGroup orientation={"vertical"}
      spacing={2}
    >
      <Stack w={"100"} direction={orientation == "vertical" ? "column" : "row"}>
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
          label="ROOM CODE"
        />
      </Stack>

      <Button
        w={"100%"}
        onClick={() => {
          if (!roomCode) {
            toast({ variant: "subtle", position: "top-right", title: "Missing Room Code", status: "error", duration: 1000 })
            return;
          }
          if (!playerName) {
            toast({ variant: "subtle", position: "top-right", title: "Missing Player Name", status: "error", duration: 1000 })
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