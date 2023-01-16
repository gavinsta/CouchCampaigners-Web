import { Box, ButtonGroup, Heading, HStack, IconButton, Text } from "@chakra-ui/react";
import { useConnectionContext } from "../contexts/ConnectionContext"
import { AiFillCaretRight, AiFillCaretLeft } from "react-icons/ai"
import DirectionalButtons from "../DirectionalButtons";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import { CommandInput } from "../../types/ConnectionInterfaces";
import BravesSelector from "./BravesSelector";
const CharacterCreationControlDisplay = () => {
  const { sendInput } = useGameControllerContext();
  function chooseDirection(fieldName: string, direction: string) {
    sendInput(fieldName, direction);
  }

  return (<>
    <Heading>Character Creation</Heading>
    <Box>Traits here</Box>
    {
      //TODO implement Trait selection (KEY FUNCTIONALITY)
    }
    <HStack>

      <DirectionalButtons directions="horizontal" output={(direction: string) => {
        chooseDirection("race", direction)
      }}
        label={"Select Race"} />
      <DirectionalButtons
        directions="horizontal"
        output={(direction: string) => {
          chooseDirection("class", direction)
        }}
        label={"Select Class"} />
    </HStack>
    <BravesSelector />
  </>)
}

export default CharacterCreationControlDisplay