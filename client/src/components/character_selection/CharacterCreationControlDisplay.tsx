import { Box, Center, Heading, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import DirectionalButtons from "../DirectionalButtons";
import { useGameControllerContext } from "../contexts/GameControllerContext";
import BravesSelector from "./BravesSelector";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import ColorSelection, { Color } from "../input-controls/ColorSelection";
const CharacterCreationControlDisplay = () => {
  const { sendInput } = useGameControllerContext();
  const isMobile = useCheckMobileScreen();
  function chooseDirection(fieldName: string, direction: string) {
    sendInput(fieldName, direction);
  }
  function ready() {
    sendInput("ready", "true")
  }

  const primaryColors: Color[] = [{
    r: 200, g: 150, b: 50, a: 1
  },
  {
    r: 200, g: 50, b: 50, a: 1
  },
  {
    r: 155, g: 155, b: 255, a: 1
  },
  {
    r: 50, g: 50, b: 150, a: 1
  },
  {
    r: 50, g: 150, b: 50, a: 1
  }];

  const skinColors: Color[] = [{
    r: 141, g: 85, b: 36, a: 1
  },
  {
    r: 198, g: 134, b: 66, a: 1
  },
  {
    r: 224, g: 172, b: 105, a: 1
  },
  {
    r: 241, g: 194, b: 125, a: 1
  },
  {
    r: 255, g: 219, b: 172, a: 1
  },
  ]
  return (<>
    <Heading>Character Creation</Heading>
    <Box>Traits here</Box>
    {
      //TODO implement Trait selection (KEY FUNCTIONALITY)
    }
    <Stack>
      <Center>
        <Stack>
          <Heading fontSize={20}>Skin Color</Heading>
          <ColorSelection colors={skinColors} additionalColors={3} />
        </Stack>
      </Center>
      <Center>
        <Stack>
          <Heading fontSize={20}>Primary Color</Heading>
          <ColorSelection colors={primaryColors} />
        </Stack>

      </Center>
      <Center>
        <Stack>
          <Heading fontSize={20}>Secondary Color</Heading>
          <ColorSelection colors={primaryColors} />
        </Stack>
      </Center>
    </Stack>

    <Center>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={5}
        alignContent="center"
      >

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
      </Stack>
    </Center>
  </>)
}

export default CharacterCreationControlDisplay