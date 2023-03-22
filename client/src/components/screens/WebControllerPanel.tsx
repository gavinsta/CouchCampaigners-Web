import { Button, ButtonGroup } from "@chakra-ui/react";
import { useState } from "react";
import { useConnectionContext } from "../contexts/ConnectionContext";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import InputText from "../input-controls/InputText";

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