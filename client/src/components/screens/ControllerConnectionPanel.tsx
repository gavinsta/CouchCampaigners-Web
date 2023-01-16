import { Button, ButtonGroup } from "@chakra-ui/react";
import { useState } from "react";
import { MessageType } from "../../types/ClientWSMessage";
import { useConnectionContext } from "../contexts/ConnectionContext";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import InputText from "../InputText";

export function WebControllerPanel({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) {
  const [controllerKey, setControllerKey] = useState<string>("");
  const { roomInfo } = useConnectionContext();
  const { controller, requestConnectController, disconnectController } = useGameControllerContext();

  return (<ButtonGroup
    spacing={2}
    orientation={orientation}
  >
    <InputText

      value={controllerKey}
      setValue={setControllerKey}
      isActive={controller || !roomInfo ? false : true}
      label="KEY"
    />
    <Button
      colorScheme={"blue"}
      w={300}
      disabled={!roomInfo}
      onClick={
        () => {
          if (!controller) {
            requestConnectController(controllerKey);
          }
          else {
            disconnectController();
          }
        }}
    >
      {controller ? "Disconnect Controller" : "Connect Controller"}
    </Button></ButtonGroup>)
}